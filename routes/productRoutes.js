const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

const { BASE_UPLOAD_PATH } = require("../config/uploadConfig");

const { addProduct ,getAllProducts,getProductById, searchProducts} = require('../controllers/productController');


// إعداد رفع الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const categoryName = req.body.categoryName || 'others';
    const categoryFolder = path.join(BASE_UPLOAD_PATH, categoryName);

    if (!fs.existsSync(categoryFolder)) {
      fs.mkdirSync(categoryFolder, { recursive: true });
    }
    cb(null, categoryFolder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);

    // تطهير الاسم: حذف المسافات، تحويل الحروف العربية إلى رموز إنجليزية، حذف رموز غير مناسبة
    const safeBasename = slugify(basename, {
      replacement: '_',
      remove: /[*+~.()'"!:@؟،،]/g,
      lower: true,
      strict: true,
      locale: 'ar'
    });

    const uniqueSuffix = Date.now();
    cb(null, `${safeBasename}_${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage: storage });

router.post('/products', upload.single('image'), addProduct);
router.get('/allproducts', getAllProducts);
router.get('/products/:id',getProductById);
router.get('/search',searchProducts);
module.exports = router;
