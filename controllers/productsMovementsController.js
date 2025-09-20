const db = require('../config/db');

// ➕ إضافة حركة (إدخال أو إخراج)
const addMovement = async (req, res) => {
  try {
    const { productId, rows, perRow, type, note } = req.body;

    if (!productId || !rows || !perRow || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const total = rows * perRow;

    // 1. أضف الحركة
    await db.query(
      `INSERT INTO product_movements (product_id, quantity_rows, quantity_per_row, total, movement_type, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, rows, perRow, total, type, note || null]
    );

    // 2. حدّث الكمية النهائية
    if (type === "IN") {
      await db.query(
        `UPDATE quantity SET 
           quantity_rows = quantity_rows + ?,
           quantity_per_row = quantity_per_row + ?,
           total = total + ?
         WHERE product_id = ?`,
        [rows, perRow, total, productId]
      );
    } else if (type === "OUT") {
      await db.query(
        `UPDATE quantity SET 
           quantity_rows = quantity_rows - ?,
           quantity_per_row = quantity_per_row - ?,
           total = total - ?
         WHERE product_id = ?`,
        [rows, perRow, total, productId]
      );
    }

    res.json({ message: "تم تسجيل الحركة وتحديث الكمية" });
  } catch (error) {
    console.error("Add movement error:", error);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

// 📦 جلب كل الحركات لمنتج محدد
const getMovementsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM product_movements WHERE product_id = ? ORDER BY created_at DESC`,
      [productId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get movements error:", error);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

module.exports = { addMovement, getMovementsByProduct };
