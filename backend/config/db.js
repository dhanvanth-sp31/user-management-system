// =========================================================
// db.js — MySQL connection pool
// Reads credentials from environment variables only.
// Never hardcode credentials here.
// =========================================================

const mysql = require("mysql2/promise");

const urlDB='mysql://root:mfGgWsccXeVoNHUgZBDQhEaEnAXjBzOQ@mysql.railway.internal:3306/railway'
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: 'root',
  password: 'sanmuhapriya@27',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Quick startup check so connection problems are obvious immediately,
// instead of surfacing on the first request.
(async function verifyConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database successfully.");
    connection.release();
  } catch (err) {
    console.error("Failed to connect to MySQL:", err);
  }
})();

const connection=mysql.createConnection(urlDB)

module.exports = pool;
