"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getSessionById, addResource } from "../services/sessionService"

function ResourceLibrary() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Upload state
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [resourceTitle, setResourceTitle] = useState("")
  const [resourceType, setResourceType] = useState("link")
  const [resourceUrl, setResourceUrl] = useState("")
  const [resourceDescription, setResourceDescription] = useState("")
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    async function fetchSession() {
      try {
        const sessionData = await getSessionById(sessionId)
        setSession(sessionData)
      } catch (error) {
        setError("Failed to load session details.")
        console.error("Error fetching session:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const handleAddResource = async (e) => {
    e.preventDefault()

    if (!resourceTitle || (resourceType === "link" && !resourceUrl)) {
      setError("Please fill in all required fields.")
      return
    }

    try {
      setUploadLoading(true)

      const resource = {
        title: resourceTitle,
        type: resourceType,
        url: resourceUrl,
        description: resourceDescription,
      }

      await addResource(sessionId, resource)

      // Refresh session data
      const updatedSession = await getSessionById(sessionId)
      setSession(updatedSession)

      // Reset form
      setShowUploadForm(false)
      setResourceTitle("")
      setResourceType("link")
      setResourceUrl("")
      setResourceDescription("")
      setError("")
    } catch (error) {
      setError("Failed to add resource. Please try again.")
      console.error("Error adding resource:", error)
    } finally {
      setUploadLoading(false)
    }
  }

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "link":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "note":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-8 8a2 2 0 01-.586.586l-4 1a1 1 0 01-1.171-1.171l1-4a2 2 0 01.586-.586l8-8z" />
            <path
              fillRule="evenodd"
              d="M11.293 1.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-9 9a1 1 0 01-.39.242l-3 1a1 1 0 01-1.266-1.265l1-3a1 1 0 01.242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        )
    }
  }

  if (loading && !session) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading resources...</p>
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => navigate(`/sessions/${sessionId}`)}
          >
            Back to Session
          </button>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Resources for {session.title}</h1>
            <p className="mt-1 text-sm text-gray-500">Share study materials with your group</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/sessions/${sessionId}`)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Session
            </button>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showUploadForm ? "Cancel" : "Add Resource"}
            </button>
          </div>
        </div>

        {showUploadForm && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Resource</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Share a link, note, or other resource with your study group.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleAddResource} className="space-y-4">
                <div>
                  <label htmlFor="resource-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="resource-title"
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., Chapter 5 Notes, Helpful Article, etc."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="resource-type" className="block text-sm font-medium text-gray-700">
                    Resource Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="resource-type"
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="link">Link</option>
                      <option value="note">Note</option>
                      <option value="pdf">PDF</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {resourceType === "link" && (
                  <div>
                    <label htmlFor="resource-url" className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        id="resource-url"
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="resource-description" className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="resource-description"
                      rows={3}
                      value={resourceDescription}
                      onChange={(e) => setResourceDescription(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Briefly describe this resource..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {uploadLoading ? "Adding..." : "Add Resource"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Shared Resources</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Resources shared by you and your study partners.</p>
          </div>

          {session.resources.length === 0 ? (
            <div className="border-t border-gray-200 px-4 py-10 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resources</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a resource.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Resource
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {session.resources.map((resource) => (
                <li key={resource._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">{getResourceTypeIcon(resource.type)}</div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600">
                          {resource.type === "link" ? (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {resource.title}
                            </a>
                          ) : (
                            resource.title
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(resource.createdAt).toLocaleDateString()}</p>
                      </div>
                      {resource.description && <p className="mt-1 text-sm text-gray-500">{resource.description}</p>}
                      <p className="mt-1 text-xs text-gray-500">Shared by {resource.user.name}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResourceLibrary
