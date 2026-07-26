const pool = require("../database/db");
async function registerUser(userData) {
    return {
        success: true,
        message: "Service is working!"
    };
}

module.exports = {
    registerUser,
};