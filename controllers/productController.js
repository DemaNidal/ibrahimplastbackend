const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const addProduct = (req, res) => {
  const {
     name, categoryId, color, currencyId, madeFrom, unit,
  usageId, quantity, price, size_value, size_unit,
  location, description
  } = req.body;

  const safeValue = (val) => (val === '' ? null : val);

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }

  console.log('Product before submit:', req.body);

  const sql = `INSERT INTO product 
    (product_name, category_id, color_id, currency_id, made_from_id, unit_id, \`usage_id\`, quantity, price, size_value, size_unit_id, location, notes, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    name,
    safeValue(categoryId),
    safeValue(color),
    safeValue(currencyId),
    safeValue(madeFrom),
    safeValue(unit),
    safeValue(usageId),
    safeValue(quantity),
    safeValue(price),
    safeValue(size_value),
    safeValue(size_unit),
    safeValue(location),
    safeValue(description),
    image
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      
      return res.status(500).json({ message: 'خطأ أثناء إضافة المنتج' });
    }

    res.status(201).json({
      message: 'تمت إضافة المنتج بنجاح',
      productId: result.insertId
    });
  });
};

module.exports = { addProduct };
