const express = require('express');
const cors = require('cors');
const app = express();
const { BASE_UPLOAD_PATH } = require("./config/uploadConfig");
require("dotenv").config();
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");

const path = require('path');

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(BASE_UPLOAD_PATH)));


const authRoutes = require('./routes/authRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
const productRoutes = require('./routes/productRoutes');

// Auth Routes
app.use('/api', authRoutes);
app.use('/api', lookupRoutes);
app.use('/api', productRoutes);

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Error: "You are not authenticated" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({ Error: "Token is not valid" });
    } else {
      req.user = decoded; // contains user_id, username, role
      next();
    }
  });
};


app.get("/api", verifyUser, (req, res) => {
  return res.json({
    Status: "Success",
    user_id: req.user.user_id,
    username: req.user.username,
    role: req.user.role,
  });
});

// Run Server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
