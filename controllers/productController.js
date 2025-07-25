const db = require('../config/db');
const path = require('path');

const addProduct = (req, res) => {
  const {
    name, categoryId, color, currencyId, madeFrom, unit,
    usageId, quantity, price, size_value, size_unit,
    location, description, variants
  } = req.body;

  const safeValue = (val) => (val === '' ? null : val);

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }

  let parsedVariants = [];

  if (variants) {
    try {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    } catch (err) {
      return res.status(400).json({ message: 'صيغة variants غير صالحة' });
    }
  }

  const sql = `INSERT INTO products 
(product_name, category_id, usage_id, made_from_id, price, currency_id, color_id, image_url, notes, unit_id)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    name,
    safeValue(categoryId),
    safeValue(usageId),
    safeValue(madeFrom),
    safeValue(price),
    safeValue(currencyId),
    safeValue(color),
    image,
    safeValue(description),
    safeValue(unit)
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Product insert error:", err);
      return res.status(500).json({ message: 'خطأ أثناء إضافة المنتج' });
    }

    const productId = result.insertId;

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      return res.status(400).json({ message: 'يجب إدخال تنويع واحد على الأقل لهذا المنتج' });
    }

    const variantSql = `INSERT INTO product_variants 
      (product_id, quantity_rows, quantity_per_row, location, size_value, size_unit_id, warehouse_id) 
      VALUES ?`;

    const variantValues = parsedVariants.map(v => [
      productId,
      parseInt(v.quantity_rows) || 0,
      parseInt(v.quantity_per_row) || 0,
      v.location || null,
      v.size_value || null,
      v.size_unit_id || null,
      v.warehouse_id || null,
    ]);

    db.query(variantSql, [variantValues], (variantErr, variantResult) => {
      if (variantErr) {
        console.error("Variant insert error:", variantErr);
        return res.status(500).json({ message: 'تمت إضافة المنتج، لكن حدث خطأ في إضافة التنويعات' });
      }

      res.status(201).json({
        message: 'تمت إضافة المنتج والتنويعات بنجاح',
        productId,
        variantsCount: variantResult.affectedRows
      });
    });
  });
};

module.exports = { addProduct };
