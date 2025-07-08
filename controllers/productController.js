const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const addProduct = (req, res) => {
    const { name, category, color, currency, madeFrom, unit, usage, quantity, price, size_value, sizeUnit, location, notes, barcode } = req.body;
    let image = null;

    if (req.file) {
        image = req.file.filename;
    }
    console.log("name"+sizeUnit);
 console.log('Product before submit:', req.body);
    const sql = `INSERT INTO product 
(product_name, category_id, color_id, currency_id, made_from_id, unit_id, \`usage_id\`, quantity, price, size_value, size_unit_id, location, notes, barcode, image_url)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;


    const values = [name, category, color, currency, madeFrom, unit, usage, quantity, price, size_value, sizeUnit, location, notes, barcode, image];

    db.query(sql, values, (err, result) => {
       
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'خطأ أثناء إضافة المنتج' });
        }
        res.status(201).json({ message: 'تمت إضافة المنتج بنجاح' });
    });
};

module.exports = { addProduct };
