const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  const token = req.cookies.token; // JWT من الكوكي
  if (!token) return res.status(401).json({ error: "You are not authenticated" });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token is not valid" });

    req.user = decoded; // user_id, username, role
    next();
  });
};

module.exports = verifyUser;