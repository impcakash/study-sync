"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserSessions } from "../services/sessionService"

function Calendar() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    async function fetchSessions() {
      try {
        const userSessions = await getUserSessions()
        setSessions(userSessions.filter((session) => session.finalizedSlot))
      } catch (error) {
        setError("Failed to load sessions.")
        console.error("Error fetching sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const monthName = currentMonth.toLocaleString("default", { month: "long" })

    // Filter sessions for the current month
    const sessionsThisMonth = sessions.filter((session) => {
      const sessionDate = new Date(session.finalizedSlot.startTime)
      return sessionDate.getMonth() === month && sessionDate.getFullYear() === year
    })

    // Create calendar grid
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 h-24 sm:h-32"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)

      // Find sessions for this day
      const sessionsForDay = sessionsThisMonth.filter((session) => {
        const sessionDate = new Date(session.finalizedSlot.startTime)
        return sessionDate.getDate() === day
      })

      days.push(
        <div key={day} className="bg-white border border-gray-200 h-24 sm:h-32 p-2">
          <div className="font-medium text-sm">{day}</div>
          <div className="mt-1 overflow-y-auto max-h-20 sm:max-h-24">
            {sessionsForDay.map((session) => (
              <Link
                key={session._id}
                to={`/sessions/${session._id}`}
                className="block text-xs p-1 mt-1 rounded bg-indigo-100 text-indigo-800 truncate hover:bg-indigo-200"
              >
                {new Date(session.finalizedSlot.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                - {session.title}
              </Link>
            ))}
          </div>
        </div>,
      )
    }

    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthName} {year}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-gray-50 text-center py-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Study Calendar</h1>
          <Link
            to="/create-session"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Session
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Loading your calendar...</p>
          </div>
        ) : (
          renderCalendar()
        )}

        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Upcoming Sessions</h2>
          {sessions.filter((session) => new Date(session.finalizedSlot.startTime) > new Date()).length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming sessions scheduled.</p>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {sessions
                  .filter((session) => new Date(session.finalizedSlot.startTime) > new Date())
                  .sort((a, b) => new Date(a.finalizedSlot.startTime) - new Date(b.finalizedSlot.startTime))
                  .map((session) => (
                    <li key={session._id}>
                      <Link to={`/sessions/${session._id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">{session.title}</p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Confirmed
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {new Date(session.finalizedSlot.startTime).toLocaleString()}
                              </p>
                            </div>
                            {session.finalizedSlot.location && (
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>{session.finalizedSlot.location}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calendar
