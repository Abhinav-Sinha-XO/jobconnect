const pool = require("../database/db");

async function registerUser(userData) {

    const { name, email, password, role } = userData;

    // Step 1: Check if email already exists
    const existingUser = await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = $1;
        `,
        [email]
    );

    // Step 2: Stop registration if email exists
    if (existingUser.rows.length > 0) {
        return {
            success: false,
            message: "Email already registered."
        };
    }

    // Step 3: Insert new user
    const result = await pool.query(
        `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [name, email, password, role]
    );

    // Step 4: Return inserted user
    return {
        success: true,
        message: "User registered successfully.",
        user: result.rows[0],
    };
}

module.exports = {
    registerUser,
};