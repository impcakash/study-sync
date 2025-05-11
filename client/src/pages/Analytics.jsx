"use client"

import { useState, useEffect } from "react"
import { getUserSessions } from "../services/sessionService"

function Analytics() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchSessions() {
      try {
        const userSessions = await getUserSessions()
        setSessions(userSessions)
      } catch (error) {
        setError("Failed to load sessions.")
        console.error("Error fetching sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  // Calculate analytics data
  const calculateAnalytics = () => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        averageRating: 0,
        topSubjects: [],
        averageDuration: 0,
        participationRate: 0,
        monthlyActivity: [],
      }
    }

    // Total sessions
    const totalSessions = sessions.length

    // Completed sessions (has feedback)
    const completedSessions = sessions.filter((session) => session.feedback && session.feedback.length > 0).length

    // Average rating
    let totalRating = 0
    let ratingCount = 0

    sessions.forEach((session) => {
      if (session.feedback) {
        session.feedback.forEach((feedback) => {
          totalRating += feedback.rating
          ratingCount++
        })
      }
    })

    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0

    // Top subjects
    const subjectCounts = {}

    sessions.forEach((session) => {
      if (session.subject) {
        subjectCounts[session.subject] = (subjectCounts[session.subject] || 0) + 1
      }
    })

    const topSubjects = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([subject, count]) => ({ subject, count }))

    // Average duration
    let totalDuration = 0
    let durationCount = 0

    sessions.forEach((session) => {
      if (session.finalizedSlot) {
        const startTime = new Date(session.finalizedSlot.startTime)
        const endTime = new Date(session.finalizedSlot.endTime)
        const duration = (endTime - startTime) / (1000 * 60 * 60) // in hours

        totalDuration += duration
        durationCount++
      }
    })

    const averageDuration = durationCount > 0 ? (totalDuration / durationCount).toFixed(1) : 0

    // Participation rate
    const currentUserId = sessions.length > 0 ? sessions[0].host._id : null
    const hostedSessions = sessions.filter((session) => session.host._id === currentUserId).length
    const participatedSessions = sessions.filter((session) => session.host._id !== currentUserId).length

    const participationRate = totalSessions > 0 ? ((participatedSessions / totalSessions) * 100).toFixed(0) : 0

    // Monthly activity
    const monthlyActivity = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = month.toLocaleString("default", { month: "short" })

      const sessionsInMonth = sessions.filter((session) => {
        const sessionDate = new Date(session.createdAt)
        return sessionDate.getMonth() === month.getMonth() && sessionDate.getFullYear() === month.getFullYear()
      }).length

      monthlyActivity.push({ month: monthName, count: sessionsInMonth })
    }

    return {
      totalSessions,
      completedSessions,
      averageRating,
      topSubjects,
      averageDuration,
      participationRate,
      monthlyActivity,
    }
  }

  const analytics = calculateAnalytics()

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Study Analytics</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Loading your analytics...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10 bg-white shadow overflow-hidden sm:rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics available</h3>
            <p className="mt-1 text-sm text-gray-500">You need to participate in study sessions to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{analytics.totalSessions}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed Sessions</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{analytics.completedSessions}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{analytics.averageRating} / 5</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Average Duration</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{analytics.averageDuration} hours</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Subjects */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Top Subjects</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Subjects you study most frequently</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                {analytics.topSubjects.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-sm text-gray-500">No subject data available yet.</div>
                ) : (
                  <div className="px-4 py-5 sm:px-6">
                    <div className="space-y-4">
                      {analytics.topSubjects.map((subject, index) => (
                        <div key={index} className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium text-gray-900">{subject.subject}</div>
                            <div className="text-sm text-gray-500">{subject.count} sessions</div>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${(subject.count / analytics.totalSessions) * 100}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Activity */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Activity</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Your study session frequency over the last 6 months
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="h-64">
                  <div className="h-full flex items-end">
                    {analytics.monthlyActivity.map((month, index) => (
                      <div key={index} className="w-1/6 h-full flex flex-col justify-end items-center">
                        <div
                          className="w-12 bg-indigo-600 rounded-t"
                          style={{
                            height: `${month.count > 0 ? (month.count / Math.max(...analytics.monthlyActivity.map((m) => m.count))) * 100 : 0}%`,
                            minHeight: month.count > 0 ? "10%" : "0",
                          }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">{month.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Participation Stats */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Participation Stats</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">How you engage with study sessions</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Sessions Hosted</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {sessions.filter((session) => session.host._id === (sessions[0]?.host._id || "")).length}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Sessions Joined</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {sessions.filter((session) => session.host._id !== (sessions[0]?.host._id || "")).length}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Participation Rate</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {analytics.participationRate}% of sessions are ones you joined (vs. hosted)
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Resources Shared</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {sessions.reduce(
                        (total, session) =>
                          total +
                          (session.resources
                            ? session.resources.filter((r) => r.user._id === (sessions[0]?.host._id || "")).length
                            : 0),
                        0,
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
