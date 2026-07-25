const { Pool } = require("pg");
const config = require("../config/config");

const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
});

async function connectDB() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("✅ PostgreSQL Connected Successfully");
        console.log(result.rows);
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);
    }
}

connectDB();

module.exports = pool;