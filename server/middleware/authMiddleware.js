const jwt = require("jsonwebtoken");
const db = require("../config/database");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.execute(
      "SELECT id, name, email, role, is_active, session_token FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Token is not valid" });
    }

    const user = users[0];
    if (user.session_token !== decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Session expired. You have logged in from another device.",
      });
    }

    if (!user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Account is deactivated" });
    }

    // ✅ Check session validity
    if (user.session_token !== decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Session expired. You have logged in from another device.",
      });
    }

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

module.exports = { authenticate };
