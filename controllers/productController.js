const db = require("../config/db");
const path = require("path");
const { BASE_UPLOAD_PATH } = require("../config/uploadConfig");
const addProduct = async (req, res) => {
  try {
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

    if (!name || !categoryId) {
      return res.status(400).json({ message: "الاسم والفئة مطلوبان" });
    }

    const safeValue = (val) =>
      val === "" || val === undefined || val === null ? null : val;

    let image = null;
    if (req.file) {
      const fullPath = req.file.path.replace(/\\/g, "/");
      const basePath = BASE_UPLOAD_PATH.replace(/\\/g, "/");
      image = fullPath.startsWith(basePath)
        ? fullPath.substring(basePath.length + 1)
        : req.file.filename;
    }

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

    const [result] = await db.query(sql, values);
    const productId = result.insertId;

    let parsedColors = [];
    let parsedQuantities = [];
    let parsedLocations = [];

    try {
      parsedColors = Array.isArray(color) ? color : JSON.parse(color || "[]");
      parsedQuantities = Array.isArray(quantities)
        ? quantities
        : JSON.parse(quantities || "[]");
      parsedLocations = Array.isArray(locations)
        ? locations
        : JSON.parse(locations || "[]");
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return res.status(400).json({ message: "تنسيق بيانات غير صالح" });
    }

    // الألوان: تأكد أن parsedColors مصفوفة من أرقام (color ids)
    if (Array.isArray(parsedColors) && parsedColors.length > 0) {
      const colorValues = parsedColors.map((id) => [productId, id]);
      await db.query(
        `INSERT INTO product_color (product_id, color_id) VALUES ?`,
        [colorValues]
      );
    }

    // الكميات: تأكد أن parsedQuantities مصفوفة من كائنات تحتوي (rows, perRow)
    if (Array.isArray(parsedQuantities) && parsedQuantities.length > 0) {
      const quantityValues = parsedQuantities.map((q) => [
        productId,
        q.rows,
        q.perRow,
      ]);
      await db.query(
        `INSERT INTO quantity (product_id, quantity_rows, quantity_per_row) VALUES ?`,
        [quantityValues]
      );
    }

    // المواقع: تأكد أن parsedLocations مصفوفة من كائنات تحتوي (location, warehouse_id)
    if (Array.isArray(parsedLocations) && parsedLocations.length > 0) {
      const locationValues = parsedLocations.map((loc) => [
        productId,
        loc.location,
        loc.warehouse_id,
      ]);
      await db.query(
        `INSERT INTO location (product_id, location, warehouse_id) VALUES ?`,
        [locationValues]
      );
    }

    res.status(201).json({
      message: "تمت إضافة المنتج بنجاح",
      productId,
    });
  } catch (err) {
    console.error("Product insert error:", err);
    res.status(500).json({ message: "خطأ أثناء إضافة المنتج" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT 
        p.product_id,
        p.product_name AS name,
        p.price,
        p.size_value,
        su.size_unit_name AS sizeUnit,
        c.category_name AS category,
        p.image_url,
        cu.currency_name AS currency
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN size_unit su ON p.size_unit_id = su.size_unit_id
      LEFT JOIN currency cu ON p.currency_id = cu.currency_id
    `);

    const productIds = products.map((p) => p.product_id);
    if (productIds.length === 0) return res.json([]);

    const [colorResults] = await db.query(
      `
      SELECT 
        pc.product_id,
        JSON_ARRAYAGG(
          JSON_OBJECT('color_id', col.color_id, 'colorName', col.color_name)
        ) AS colors
      FROM product_color pc
      JOIN color col ON pc.color_id = col.color_id
      WHERE pc.product_id IN (?)
      GROUP BY pc.product_id;
    `,
      [productIds]
    );
    const lookup = colorResults.reduce((acc, row) => {
      acc[row.product_id] = row.colors; // No JSON.parse!
      return acc;
    }, {});

    const enrichedProducts = products.map((prod) => ({
      ...prod,
      colors: lookup[prod.product_id] || [],
    }));

    res.json(enrichedProducts);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "فشل في جلب المنتجات" });
  }
};

const getProductById = async (req, res) => {
  const productId = req.params.id;

  try {
    // ✅ ما في داعي ل .promise() لأنك عملت له من db.js
    const [productRows] = await db.query(
      `SELECT 
        p.product_id, p.product_name, p.notes, p.size_value, 
        p.image_url, p.price, 
        c.category_name, 
        u.usage_name, 
        m.made_from_name,
        uq.unit_name AS quantity_unit, 
        su.size_unit_name, 
        cr.currency_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN usage_table u ON p.usage_id = u.usage_id
      LEFT JOIN made_from m ON p.made_from_id = m.made_from_id
      LEFT JOIN unit_for_quantity uq ON p.unit_id = uq.unit_id
      LEFT JOIN size_unit su ON p.size_unit_id = su.size_unit_id
      LEFT JOIN currency cr ON p.currency_id = cr.currency_id
      WHERE p.product_id = ?`,
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];

    const [colors] = await db.query(
      `SELECT c.color_id, c.color_name
       FROM product_color pc
       JOIN color c ON pc.color_id = c.color_id
       WHERE pc.product_id = ?`,
      [productId]
    );

    const [quantities] = await db.query(
      `SELECT quantity_id, quantity_rows, quantity_per_row, total
       FROM quantity
       WHERE product_id = ?`,
      [productId]
    );

    const [locations] = await db.query(
      `SELECT l.location_id, l.location, w.name AS warehouse_name
       FROM location l
       LEFT JOIN warehouse w ON l.warehouse_id = w.id
       WHERE l.product_id = ?`,
      [productId]
    );

    const fullProduct = {
      ...product,
      colors,
      quantities,
      locations,
    };

    res.json(fullProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// افترض عندك db من mysql2/promise pool
const searchProducts = async (req, res) => {
  try {
    const searchByName = req.query.term;
    if (!searchByName) {
      return res.status(400).json({
        error: "search term is required",
      });
    }

    console.log("Search term from query:", searchByName);

    const searchValue = `%${searchByName}%`; // partial match anywhere

    // 1. Get products matching search term
    const productQuery = `
      SELECT 
        p.product_id,
        p.product_name AS name,
        p.price,
        p.size_value,
        su.size_unit_name AS sizeUnit,
        c.category_name AS category,
        p.image_url,
        cu.currency_name AS currency
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN size_unit su ON p.size_unit_id = su.size_unit_id
      LEFT JOIN currency cu ON p.currency_id = cu.currency_id
      WHERE product_name LIKE ?
    `;

    const [products] = await db.query(productQuery, [searchValue]);

    if (products.length === 0) {
      return res.json([]); // no results
    }

    // Extract product IDs for the next queries
    const productIds = products.map((p) => p.product_id);

    // 2. Get colors for all products found
    const colorQuery = `
      SELECT pc.product_id, c.color_id, c.color_name AS colorName
      FROM product_color pc
      JOIN color c ON pc.color_id = c.color_id
      WHERE pc.product_id IN (?)
    `;

    const [colors] = await db.query(colorQuery, [productIds]);

    // 3. Get locations for all products found (with warehouse)
    const locationQuery = `
      SELECT loc.product_id, loc.location, w.name AS warehouse_name
      FROM location loc
      LEFT JOIN warehouse w ON loc.warehouse_id = w.id
      WHERE loc.product_id IN (?)
    `;
    const [locations] = await db.query(locationQuery, [productIds]);

    // 4. Get quantities for all products found
    const quantityQuery = `
      SELECT product_id, quantity_rows, quantity_per_row, total
      FROM quantity 
      WHERE product_id IN (?)
    `;
    const [quantities] = await db.query(quantityQuery, [productIds]);

    // 5. Combine related data into each product
    const productsWithDetails = products.map((product) => {
      return {
        ...product,
        colors: colors
          .filter((c) => c.product_id === product.product_id)
          .map((c) => ({ color_id: c.color_id, colorName: c.colorName })),
        locations: locations
          .filter((l) => l.product_id === product.product_id)
          .map((l) => ({
            location: l.location,
            warehouse_name: l.warehouse_name,
          })),
        quantities: quantities
          .filter((q) => q.product_id === product.product_id)
          .map((q) => ({
            qyantity_rows: q.quantity_rows,
            quantity_per_rows: q.quantity_per_row,
            total: q.total,
          })),
      };
    });

    console.log("Search results count:", productsWithDetails.length);
    res.json(productsWithDetails);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({
      error: "Database error",
      details: err.message,
    });
  }
};

module.exports = { addProduct, getAllProducts, getProductById, searchProducts };
