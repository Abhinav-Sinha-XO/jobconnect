const bcrypt = require("bcrypt");

const pool = require("../database/db");

const ApiError = require("../utils/ApiError");

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
        throw new ApiError(
            401,
            "Invalid email or password."
        );
    }

    const {
        password: hashedPassword,
        ...safeUser
    } = user;

    return {
        success: true,
        message: "Login successful.",
        user: safeUser
    };

};

module.exports = {
  registerUser,
  loginUser,
};
