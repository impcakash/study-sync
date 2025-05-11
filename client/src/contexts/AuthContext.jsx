"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in with JWT
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        try {
          // Set the auth token for all future requests
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`

          // Verify the token and get user data
          const response = await api.get("/api/auth/me")
          setCurrentUser(response.data)
        } catch (error) {
          console.error("Auth token invalid:", error)
          localStorage.removeItem("token")
          delete api.defaults.headers.common["Authorization"]
        }
      }

      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  // Login function
  async function login(email, password) {
    try {
      const response = await api.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("token", token)

      // Set auth header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return user
    } catch (error) {
      throw error.response?.data?.message || "Login failed"
    }
  }

  // Register function
  async function register(name, email, password) {
    try {
      const response = await api.post("/api/auth/register", { name, email, password })
      const { token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("token", token)

      // Set auth header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return user
    } catch (error) {
      throw error.response?.data?.message || "Registration failed"
    }
  }

  // Logout function
  function logout() {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
