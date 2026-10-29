"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getUsers } from "@/actions/user-management"
import type { UserProfile } from "@/actions/user-management"
import { signOutAction } from "@/actions/auth"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [error, setError] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    doctors: 0,
    patients: 0,
  })

  useEffect(() => {
    let active = true

    const load = async () => {
      const result = await getUsers(1, 50)

      if (!active) return

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      const rows = result.users
      setUserEmail("")
      const today = new Date().toDateString()

      setUsers(rows)
      setStats({
        totalUsers: result.total,
        newUsersToday: rows.filter((user) => new Date(user.created_at).toDateString() === today).length,
        doctors: rows.filter((user) => user.role === "doctor").length,
        patients: rows.filter((user) => user.role === "patient").length,
      })
      setIsLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const handleLogout = async () => {
    await signOutAction()
  }

  const ageOf = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "-"
    const born = new Date(dateOfBirth)
    const diff = Date.now() - born.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString()
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #e11d48",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#6b7280" }}>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827" }}>Admin access required</h1>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>{error}</p>
          <Link href="/admin/login" style={{ color: "#e11d48" }}>
            Sign in as an administrator
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Admin Header */}
      <header
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827", margin: 0 }}>
            🔐 FertiTerra Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>
            Welcome, {userEmail || "administrator"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.875rem",
              padding: "0.5rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
            }}
          >
            View Site
          </Link>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#e11d48",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main style={{ padding: "2rem" }}>
        {/* Statistics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", margin: "0 0 0.5rem 0" }}>
              Total Users
            </h3>
            <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827", margin: 0 }}>{stats.totalUsers}</p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", margin: "0 0 0.5rem 0" }}>
              New Users Today
            </h3>
            <p style={{ fontSize: "2rem", fontWeight: "600", color: "#10b981", margin: 0 }}>{stats.newUsersToday}</p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", margin: "0 0 0.5rem 0" }}>
              Countries
            </h3>
            <p style={{ fontSize: "2rem", fontWeight: "600", color: "#3b82f6", margin: 0 }}>{stats.doctors}</p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "0.875rem", fontWeight: "500", color: "#6b7280", margin: "0 0 0.5rem 0" }}>
              Average Age
            </h3>
            <p style={{ fontSize: "2rem", fontWeight: "600", color: "#f59e0b", margin: 0 }}>{stats.patients}</p>
          </div>
        </div>

        {/* Users Table */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", margin: 0 }}>
              Registered Users ({users.length})
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Age
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Country
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.email} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#111827" }}>{user.full_name ?? "-"}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#111827" }}>{user.email}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#111827" }}>{ageOf(user.date_of_birth)}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#111827" }}>{user.phone ?? "-"}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          backgroundColor: user.role === "admin" ? "#fef3c7" : "#dcfce7",
                          color: user.role === "admin" ? "#92400e" : "#166534",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
