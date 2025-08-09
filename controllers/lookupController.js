const db = require('../config/db'); // ملف الاتصال بالـ MySQL

exports.getCategories = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM category ORDER BY category_name ASC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getColors = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM color ORDER BY color_name ASC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCurrencies = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM currency');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMadeFrom = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM made_from');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUnits = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM unit_for_quantity');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUsages = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM usage_table');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSizeUnits = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM size_unit');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getwarehouse = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM warehouse ORDER BY name ASC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
