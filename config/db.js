const mysql = require('mysql2/promise'); // استخدم النسخة الخاصة بالوعود

const db = mysql.createPool({ // استخدم createPool بدلاً من createConnection لدعم الوعود
  host: 'localhost',
  user: 'root',
  password: 'dmdmkh123',
  database: 'plastic_shop',
  charset: 'utf8mb4',
});

module.exports = db;
