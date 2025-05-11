const express = require("express")
const mongoose = require("mongoose")
const Session = require("../models/Session")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Apply auth middleware to all routes
router.use(auth)

// @route   GET /api/sessions
// @desc    Get all sessions
// @access  Private
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("host", "name email")
      .populate("participants", "name email")
      .sort({ createdAt: -1 })

    res.json(sessions)
  } catch (error) {
    console.error("Get sessions error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/sessions/user
// @desc    Get sessions for current user (hosted or participating)
// @access  Private
router.get("/user", async (req, res) => {
  try {
    const userId = req.user._id

    const sessions = await Session.find({
      $or: [{ host: userId }, { participants: userId }],
    })
      .populate("host", "name email")
      .populate("participants", "name email")
      .populate("timeSlots.proposedBy", "name")
      .populate("timeSlots.votes.user", "name")
      .populate("resources.user", "name")
      .populate("feedback.user", "name")
      .sort({ createdAt: -1 })

    res.json(sessions)
  } catch (error) {
    console.error("Get user sessions error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("host", "name email")
      .populate("participants", "name email")
      .populate("timeSlots.proposedBy", "name")
      .populate("timeSlots.votes.user", "name")
      .populate("resources.user", "name")
      .populate("feedback.user", "name")

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    res.json(session)
  } catch (error) {
    console.error("Get session error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Session not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { title, description, subject, participants } = req.body

    // Find or create participants
    const participantIds = []

    if (participants && participants.length > 0) {
      for (const email of participants) {
        // Check if user exists
        let user = await User.findOne({ email })

        // If user doesn't exist, create a placeholder user
        if (!user) {
          user = new User({
            name: email.split("@")[0], // Simple placeholder name
            email,
            password: Math.random().toString(36).slice(-8), // Random password
          })

          await user.save()
        }

        participantIds.push(user._id)
      }
    }

    // Create new session
    const newSession = new Session({
      title,
      description,
      subject,
      host: req.user._id,
      participants: participantIds,
      timeSlots: [],
      resources: [],
      feedback: [],
    })

    await newSession.save()

    // Populate session data
    const session = await Session.findById(newSession._id)
      .populate("host", "name email")
      .populate("participants", "name email")

    res.status(201).json(session)
  } catch (error) {
    console.error("Create session error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/sessions/:id/timeslots
// @desc    Propose a time slot
// @access  Private
router.post("/:id/timeslots", async (req, res) => {
  try {
    const { startTime, endTime, location } = req.body

    const session = await Session.findById(req.params.id)

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Create new time slot
    const newTimeSlot = {
      startTime,
      endTime,
      location,
      proposedBy: req.user._id,
      votes: [],
    }

    // Add time slot to session
    session.timeSlots.push(newTimeSlot)
    await session.save()

    // Populate session data
    const updatedSession = await Session.findById(req.params.id)
      .populate("host", "name email")
      .populate("participants", "name email")
      .populate("timeSlots.proposedBy", "name")
      .populate("timeSlots.votes.user", "name")

    res.status(201).json(updatedSession)
  } catch (error) {
    console.error("Propose time slot error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Session not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/sessions/:id/timeslots/:timeSlotId/vote
// @desc    Vote for a time slot
// @access  Private
router.post("/:id/timeslots/:timeSlotId/vote", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Find time slot
    const timeSlot = session.timeSlots.id(req.params.timeSlotId)

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" })
    }

    // Check if user has already voted
    const existingVote = timeSlot.votes.find((vote) => vote.user.toString() === req.user._id.toString())

    if (existingVote) {
      return res.status(400).json({ message: "You have already voted for this time slot" })
    }

    // Remove votes from other time slots
    session.timeSlots.forEach((slot) => {
      slot.votes = slot.votes.filter((vote) => vote.user.toString() !== req.user._id.toString())
    })

    // Add vote to selected time slot
    timeSlot.votes.push({
      user: req.user._id,
      createdAt: new Date(),
    })

    await session.save()

    // Populate session data
    const updatedSession = await Session.findById(req.params.id)
      .populate("host", "name email")
      .populate("participants", "name email")
      .populate("timeSlots.proposedBy", "name")
      .populate("timeSlots.votes.user", "name")

    res.json(updatedSession)
  } catch (error) {
    console.error("Vote for time slot error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Session or time slot not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/sessions/:id/timeslots/:timeSlotId/finalize
// @desc    Finalize a time slot
// @access  Private
router.post("/:id/timeslots/:timeSlotId/finalize", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Check if user is the host
    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can finalize a time slot" })
    }

    // Find time slot
    const timeSlot = session.timeSlots.id(req.params.timeSlotId)

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" })
    }

    // Set finalized slot
    session.finalizedSlot = timeSlot

    await session.save()

    // Populate session data
    const updatedSession = await Session.findById(req.params.id)
      .populate("host", "name email")
      .populate("participants", "name email")
      .populate("timeSlots.proposedBy", "name")
      .populate("timeSlots.votes.user", "name")

    res.json(updatedSession)
  } catch (error) {
    console.error("Finalize time slot error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Session or time slot not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/sessions/:id/resources
// @desc    Add a resource
// @access  Private
router.post("/:id/resources", async (req, res) => {
  try {
    const { title, type, url, description } = req.body

    const session = await Session.findById(req.params.id)

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Create new resource
    const newResource = {
      title,
      type,
      url,
      description,
      user: req.user._id,
    }

    // Add resource to session
    session.resources.push(newResource)
    await session.save()

    // Populate session data
    const updatedSession = await Session.findById(req.params.id)
      .populate("host", "name email")
      .populate("participants", "name email")
      .populate("resources.user", "name")

    res.status(201).json(updatedSession)
  } catch (error) {
    console.error("Add resource error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Session not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/sessions/:id/feedback
// @desc    Submit feedback
// @access  Private
router.post("/:id/feedback", async (req, res) => {
  try {
    const { rating, comment } = req.body

    const session = await Session.findById(req.params.id)

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    // Check if session has a finalized slot
    if (!session.finalizedSlot) {
      return res.status(400).json({ message: "Cannot submit feedback for a session without a finalized time slot" })
    }

    // Check if session has ended
    const now = new Date()
    const endTime = new Date(session.finalizedSlot.endTime)

    if (endTime > now) {
      return res.status(400).json({ message: "Cannot submit feedback for a session that has not ended yet" })
    }

    // Check if user has already submitted feedback
    const existingFeedback = session.feedback.find((feedback) => feedback.user.toString() === req.user._id.toString())

    if (existingFeedback) {
      return res.status(400).json({ message: "You have already submitted feedback for this session" })
    }

    // Create new feedback
    const newFeedback = {
      rating,
      comment,
      user: req.user._id,
    }

    // Add feedback to session
    session.feedback.push(newFeedback)
    await session.save()

    // Populate session data
    const updatedSession = await Session.findById(req.params.id)
      .populate("host", "name email")
      .populate("participants", "name email")
      .populate("feedback.user", "name")

    res.status(201).json(updatedSession)
  } catch (error) {
    console.error("Submit feedback error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Session not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
