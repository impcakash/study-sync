import api from "./api"

// Get all sessions
export const getAllSessions = async () => {
  try {
    const response = await api.get("/api/sessions")
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch sessions"
  }
}

// Get sessions for current user (hosted or participating)
export const getUserSessions = async () => {
  try {
    const response = await api.get("/api/sessions/user")
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch user sessions"
  }
}

// Get session by ID
export const getSessionById = async (sessionId) => {
  try {
    const response = await api.get(`/api/sessions/${sessionId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch session"
  }
}

// Create new session
export const createSession = async (sessionData) => {
  try {
    const response = await api.post("/api/sessions", sessionData)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to create session"
  }
}

// Propose time slot
export const proposeTimeSlot = async (sessionId, timeSlot) => {
  try {
    const response = await api.post(`/api/sessions/${sessionId}/timeslots`, timeSlot)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to propose time slot"
  }
}

// Vote for time slot
export const voteForTimeSlot = async (sessionId, timeSlotId) => {
  try {
    const response = await api.post(`/api/sessions/${sessionId}/timeslots/${timeSlotId}/vote`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to vote for time slot"
  }
}

// Finalize time slot
export const finalizeTimeSlot = async (sessionId, timeSlotId) => {
  try {
    const response = await api.post(`/api/sessions/${sessionId}/timeslots/${timeSlotId}/finalize`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to finalize time slot"
  }
}

// Add resource to session
export const addResource = async (sessionId, resource) => {
  try {
    const response = await api.post(`/api/sessions/${sessionId}/resources`, resource)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to add resource"
  }
}

// Submit session feedback
export const submitFeedback = async (sessionId, feedback) => {
  try {
    const response = await api.post(`/api/sessions/${sessionId}/feedback`, feedback)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || "Failed to submit feedback"
  }
}
