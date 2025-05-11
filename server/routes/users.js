const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Apply auth middleware to all routes
router.use(auth)

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/users/search/:email
// @desc    Search users by email
// @access  Private
router.get("/search/:email", async (req, res) => {
  try {
    const users = await User.find({
      email: { $regex: req.params.email, $options: "i" },
    })
      .select("-password")
      .limit(10)

    res.json(users)
  } catch (error) {
    console.error("Search users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
