const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { addProduct } = require('../controllers/productController');

// إعداد رفع الصور
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // أنشئ هذا المجلد داخل المشروع
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/products', upload.single('image'), addProduct);

module.exports = router;
