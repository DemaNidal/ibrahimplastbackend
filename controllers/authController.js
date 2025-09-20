const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

// ✅ Register Function (مع تحقق وأمان)
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // تحقق من وجود جميع الحقول
    if (!username || !email || !password) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    // تأكد ما في مستخدم مكرر
    const [results] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (results.length > 0) {
      return res.status(400).json({ message: "المستخدم موجود مسبقاً" });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إدخال المستخدم الجديد
    await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role || "employee"]
    );

    return res.status(201).json({ message: "تم إنشاء المستخدم بنجاح" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
  }
};
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "اسم المستخدم وكلمة المرور مطلوبين" });
    }

    const [results] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (results.length === 0) {
      return res.status(401).json({ message: "اسم المستخدم غير موجود" });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      // ❌ no maxAge or expires → becomes session cookie
    });

    return res.json({
      token,
      user: { id: user.user_id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};
const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
};
module.exports = { register, login, logout };
