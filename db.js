const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'your_database',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
});

// console.log(pool)

module.exports = pool;