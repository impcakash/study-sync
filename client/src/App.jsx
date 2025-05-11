"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import SessionDetail from "./pages/SessionDetail"
import CreateSession from "./pages/CreateSession"
import Calendar from "./pages/Calendar"
import ResourceLibrary from "./pages/ResourceLibrary"
import Analytics from "./pages/Analytics"
import Navbar from "./components/Navbar"
import "./index.css"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        <p className="ml-2 text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-session"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <CreateSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions/:sessionId"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <SessionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/:sessionId"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <ResourceLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
