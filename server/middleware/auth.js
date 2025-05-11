const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware to authenticate JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const token = authHeader.replace("Bearer ", "")

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user by id
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Token is not valid" })
  }
}

module.exports = auth
