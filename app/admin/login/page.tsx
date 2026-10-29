"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { adminSignInAction } from "@/actions/auth"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setMessageType("")

    // Basic validation
    if (!email || !password) {
      setMessage("Email and password are required")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    const form = new FormData()
    form.set("email", email)
    form.set("password", password)

    const result = await adminSignInAction(form)

    if (result?.error) {
      setMessage(result.error)
      setMessageType("error")
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1f2937",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "400px",
          border: "2px solid #e11d48",
        }}
      >
        {/* Admin Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              backgroundColor: "#e11d48",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            🔐 ADMIN ACCESS
          </div>
          <Image
            src="/placeholder.svg?height=45&width=160&text=FertiTerra"
            alt="FertiTerra Logo"
            width={160}
            height={45}
            style={{ height: "45px", width: "auto", marginBottom: "1rem" }}
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827", marginBottom: "0.5rem" }}>
            Admin Login
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Access the FertiTerra admin dashboard</p>
        </div>

        {/* Admin Credentials Info */}
        

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Message Display */}
          {message && (
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                backgroundColor: messageType === "success" ? "#dcfce7" : "#fef2f2",
                border: `1px solid ${messageType === "success" ? "#bbf7d0" : "#fecaca"}`,
                color: messageType === "success" ? "#166534" : "#dc2626",
                fontSize: "0.875rem",
              }}
            >
              {message}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#374151" }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fertiterra.com"
              required
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                backgroundColor: isLoading ? "#f9fafb" : "white",
                boxSizing: "border-box",
                borderColor: email === "admin@fertiterra.com" ? "#10b981" : "#d1d5db",
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#374151" }}>
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                backgroundColor: isLoading ? "#f9fafb" : "white",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: isLoading ? "#9ca3af" : "#e11d48",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {isLoading ? "Authenticating..." : "🔐 Admin Login"}
          </button>

        </form>

        {/* Footer Links */}
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <Link href="/login" style={{ color: "#6b7280", textDecoration: "none" }}>
              ← Back to User Login
            </Link>
          </div>
          <div>
            <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
