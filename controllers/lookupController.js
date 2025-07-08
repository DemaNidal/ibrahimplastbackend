const db = require('../config/db'); // ملف الاتصال بالـ MySQL

exports.getCategories = (req, res) => {
    db.query('SELECT * FROM category', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getColors = (req, res) => {
    db.query('SELECT * FROM color', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getCurrencies = (req, res) => {
    db.query('SELECT * FROM currency', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getMadeFrom = (req, res) => {
    db.query('SELECT * FROM made_from', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getUnits = (req, res) => {
    db.query('SELECT * FROM unit_for_quantity', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getUsages = (req, res) => {
    db.query('SELECT * FROM usage_table', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getSizeUnits = (req, res) => {
    db.query('SELECT * FROM size_unit', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};
