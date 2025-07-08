const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key';

// ✅ Register Function (مع تحقق وأمان)
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // تحقق من وجود جميع الحقول
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
        }

        // تأكد ما في مستخدم مكرر
        db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'خطأ في السيرفر' });

            if (results.length > 0) {
                return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });
            }

            // تشفير كلمة المرور
            const hashedPassword = await bcrypt.hash(password, 10);

            // إدخال المستخدم الجديد
            db.query(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, role || 'employee'],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'خطأ في السيرفر' });
                    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء التسجيل' });
    }
};

// ✅ Login Function (مع حماية الأخطاء)
const login = (req, res) => {
    try {
        const { username, password } = req.body;

        // تحقق من وجود الحقول
        if (!username || !password) {
            return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبين' });
        }

        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ message: 'خطأ في السيرفر' });

            if (results.length === 0) {
                return res.status(401).json({ message: 'اسم المستخدم غير موجود' });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
            }

            const token = jwt.sign(
                { user_id: user.user_id, role: user.role },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.json({ token });
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
    }
};

module.exports = { register, login };
