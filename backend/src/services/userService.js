const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const bcrypt = require("bcrypt");

const pool = require("../database/db");

const ApiError = require("../utils/ApiError");

const { sendEmail } = require("../services/email/email.service");

async function registerUser(userData) {
  const { name, email, password, role } = userData;

  if (
    !name ||
    !name.trim() ||
    !email ||
    !email.trim() ||
    !password ||
    !password.trim() ||
    !role ||
    !role.trim()
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // Step 1: Check if email already exists
  const existingUser = await pool.query(
    `
        SELECT id
        FROM users
        WHERE email = $1;
        `,
    [email],
  );

  // Step 2: Stop registration if email exists
  if (existingUser.rows.length > 0) {
    throw new ApiError(409, "Email already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // Step 3: Insert new user
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id,
                name,
                email,
                role,
                created_at;
        `,
    [name, email, hashedPassword, role],
  );

  // Step 4: Return inserted user
  return {
    success: true,
    message: "User registered successfully.",
    user: result.rows[0],
  };
}

const loginUser = async (userData) => {
  const { email, password } = userData;

  if (!email || !email.trim() || !password || !password.trim()) {
    throw new ApiError(400, "Email and password are required.");
  }
  const result = await pool.query(
    `
    SELECT
        id,
        name,
        email,
        password,
        role,
        created_at
    FROM users
    WHERE email = $1;
    `,
    [email],
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const { password: hashedPassword, ...safeUser } = user;

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    success: true,
    message: "Login successful.",
    token,
    user: safeUser,
  };
};

const getUserProfile = async (userId) => {
  const query = `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = $1;
    `;

  const result = await pool.query(query, [userId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, "User not found.");
  }

  return result.rows[0];
};

const updateUserProfile = async (userId, updateData) => {
  const userResult = await pool.query(
    `
        SELECT *
        FROM users
        WHERE id = $1
        `,
    [userId],
  );

  if (userResult.rows.length === 0) {
    throw new ApiError(404, "User not found.");
  }

  if (updateData.email) {
    const emailResult = await pool.query(
      `
            SELECT id
            FROM users
            WHERE email = $1
            `,
      [updateData.email],
    );

    if (emailResult.rows.length > 0 && emailResult.rows[0].id !== userId) {
      throw new ApiError(409, "Email already exists.");
    }
  }

  const fields = [];
  const values = [];

  if (updateData.name) {
    fields.push(`name = $${values.length + 1}`);

    values.push(updateData.name);
  }

  if (updateData.email) {
    fields.push(`email = $${values.length + 1}`);

    values.push(updateData.email);
  }
  //check whether user sends empty request body or not to update the profile
  if (fields.length === 0) {
    throw new ApiError(400, "No fields provided to update.");
  }

  values.push(userId);

  const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${values.length}
        RETURNING
            id,
            name,
            email,
            role,
            created_at
    `;

  const result = await pool.query(query, values);

  return result.rows[0];
};

const changePasswordService = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required.");
  }

  const userResult = await pool.query(
    `
        SELECT *
        FROM users
        WHERE id = $1
        `,
    [userId],
  );

  if (userResult.rows.length === 0) {
    throw new ApiError(404, "User not found.");
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    userResult.rows[0].password,
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `
        UPDATE users
        SET password = $1
        WHERE id = $2
        `,
    [hashedPassword, userId],
  );
};

const forgotPasswordService = async (email) => {
  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const userResult = await pool.query(
    `
        SELECT *
        FROM users
        WHERE email = $1
        `,
    [email],
  );

  if (userResult.rows.length === 0) {
    throw new ApiError(404, "User not found.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    `
        UPDATE users
        SET
            reset_password_token = $1,
            reset_password_expires = $2
        WHERE email = $3
        `,
    [resetToken, resetTokenExpiry, email],
  );

  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

  const subject = "Reset Your JobConnect Password";

  const text = `You requested to reset your password.

              Click the link below to reset it:${resetUrl}

              This link will expire in 15 minutes.

              If you did not request this, you can safely ignore this email.`;

  await sendEmail({
    to: email,
    subject,
    text,
  });
};


const resetPasswordService = async (
    token,
    newPassword
) => {

    if (!token || !newPassword) {
        throw new ApiError(
            400,
            "Token and new password are required."
        );
    }

    const userResult = await pool.query(
        `
        SELECT *
        FROM users
        WHERE reset_password_token = $1
        `,
        [token]
    );

    if (userResult.rows.length === 0) {
        throw new ApiError(
            400,
            "Invalid reset token."
        );
    }

    const user = userResult.rows[0];

    if (user.reset_password_expires < new Date()) {
        throw new ApiError(
            400,
            "Reset token has expired."
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    await pool.query(
        `
        UPDATE users
        SET
            password = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL
        WHERE id = $2
        `,
        [
            hashedPassword,
            user.id
        ]
    );

};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePasswordService,
  forgotPasswordService,
  resetPasswordService
};
