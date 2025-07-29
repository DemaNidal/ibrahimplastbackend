const db = require("../config/db");
const path = require("path");

const addProduct = (req, res) => {
    console.log('Request body:', req.body);

  const {
    name,
    categoryId,
    color,
    currencyId,
    madeFromId,
    unit_id,
    usageId,
    price,
    size_value,
    size_unit_id,
    description,
    quantities,
    locations,
  } = req.body;

  const safeValue = (val) => (val === "" ? null : val);

  let image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO product 
    (product_name, category_id, usage_id, made_from_id, price, currency_id, image_url, notes, unit_id, size_value, size_unit_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    safeValue(categoryId),
    safeValue(usageId),
    safeValue(madeFromId),
    safeValue(price),
    safeValue(currencyId),
    image,
    safeValue(description),
    safeValue(unit_id),
    safeValue(size_value),
    safeValue(size_unit_id),
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Product insert error:", err);
      return res.status(500).json({ message: "خطأ أثناء إضافة المنتج" });
    }

    const productId = result.insertId;
    try {
  parsedColors = color ? JSON.parse(color) : [];
  parsedQuantities = quantities ? JSON.parse(quantities) : [];
  parsedLocations = locations ? JSON.parse(locations) : [];
} catch (parseErr) {
  console.error("JSON parse error:", parseErr);
  return res.status(400).json({ message: "تنسيق بيانات غير صالح" });
}
    // إدخال الألوان (product_color)
    if (Array.isArray(parsedColors) && parsedColors.length > 0) {
      const colorValues = parsedColors.map((id) => [productId, id]);
      db.query(
        `INSERT INTO product_color (product_id, color_id) VALUES ?`,
        [colorValues],
        (colorErr) => {
          if (colorErr) console.error("Color insert error:", colorErr);
        }
      );
    }

    if (Array.isArray(parsedQuantities) && parsedQuantities.length > 0) {
      const quantityValues = parsedQuantities.map((q) => [
        productId,
        q.rows,
        q.perRow,
      ]);
      db.query(
        `INSERT INTO quantity (product_id, quantity_rows, quantity_per_row) VALUES ?`,
        [quantityValues],
        (qtyErr) => {
          if (qtyErr) console.error("Quantity insert error:", qtyErr);
        }
      );
    }

    if (Array.isArray(parsedLocations) && parsedLocations.length > 0) {
      const locationValues = parsedLocations.map((loc) => [
        productId,
        loc.location,
        loc.warehouse_id,
      ]);
      db.query(
        `INSERT INTO location (product_id, location, warehouse_id) VALUES ?`,
        [locationValues],
        (locErr) => {
          if (locErr) console.error("Location insert error:", locErr);
        }
      );
    }

    res.status(201).json({
      message: "تمت إضافة المنتج بنجاح",
      productId,
    });
  });
};

module.exports = { addProduct };
