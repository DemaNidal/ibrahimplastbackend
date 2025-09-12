const express = require('express');
const cors = require('cors');
const app = express();
const { BASE_UPLOAD_PATH } = require("./config/uploadConfig");
require("dotenv").config();
const cookieParser = require('cookie-parser');
const verifyUser = require('./middlewares/auth');

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
