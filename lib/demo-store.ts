// Seeded account store for the public demo build.
// It keeps the demo usable without a provisioned database. Production data
// access goes through the Supabase clients in lib/supabase*.ts
export const demoAccounts = {
  users: new Map<string, any>([
    // Add some demo users
    ["demo@fertiterra.com", { email: "demo@fertiterra.com", password: "demo123" }],
  ]),

  // Add a user to the database
  addUser(email: string, password: string) {
    this.users.set(email, {
      email,
      password,
      createdAt: new Date().toISOString(),
    })
    return true
  },

  // Check if a user exists
  hasUser(email: string) {
    return this.users.has(email)
  },

  // Get a user by email
  getUser(email: string) {
    return this.users.get(email)
  },

  // List all users (for debugging)
  listUsers() {
    return Array.from(this.users.keys())
  },
}
