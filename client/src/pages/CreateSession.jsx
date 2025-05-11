"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createSession } from "../services/sessionService"

function CreateSession() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [participants, setParticipants] = useState([{ email: "" }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddParticipant = () => {
    setParticipants([...participants, { email: "" }])
  }

  const handleParticipantChange = (index, value) => {
    const updatedParticipants = [...participants]
    updatedParticipants[index].email = value
    setParticipants(updatedParticipants)
  }

  const handleRemoveParticipant = (index) => {
    const updatedParticipants = [...participants]
    updatedParticipants.splice(index, 1)
    setParticipants(updatedParticipants)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    // Filter out empty participant emails
    const filteredParticipants = participants.filter((p) => p.email.trim() !== "")

    try {
      setLoading(true)
      setError("")

      const sessionData = {
        title,
        description,
        subject,
        participants: filteredParticipants.map((p) => p.email),
      }

      const newSession = await createSession(sessionData)
      navigate(`/sessions/${newSession._id}`)
    } catch (error) {
      setError("Failed to create session. Please try again.")
      console.error("Error creating session:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Study Session</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Session Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Calculus Midterm Prep"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Mathematics, Computer Science, etc."
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe what you'll be studying and any materials to bring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invite Participants</label>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="email"
                      value={participant.email}
                      onChange={(e) => handleParticipantChange(index, e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Email address"
                    />
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Participant
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Creating..." : "Create Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateSession
