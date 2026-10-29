"use server"

import { redirect } from "next/navigation"

import { createServerClient, createServiceClient } from "@/lib/supabase-server"

export type AuthResult = {
  success: boolean
  error?: string
  needsConfirmation?: boolean
  email?: string
}

type Role = "admin" | "doctor" | "patient" | "support"

/** Home route for a role, used after a successful sign in. */
function landingFor(role: Role | null | undefined): string {
  return role === "admin" ? "/admin/dashboard" : "/dashboard"
}

async function roleFor(userId: string): Promise<Role | null> {
  const supabase = createServerClient()
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return (data?.role as Role) ?? null
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const password = (formData.get("password") as string | null) ?? ""
  const fullName = (formData.get("full_name") as string | null)?.trim() ?? ""
  const phone = (formData.get("phone") as string | null)?.trim() ?? ""

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  const supabase = createServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
      data: { full_name: fullName || null, phone: phone || null },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // The profile row carries the role and the display fields. Write it with the
  // service role so signup does not depend on a permissive insert policy, and
  // ignore a duplicate because a database trigger may already have created it.
  if (data.user) {
    try {
      const service = createServiceClient()
      await service.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          full_name: fullName || null,
          phone: phone || null,
          role: "patient",
          status: "active",
        },
        { onConflict: "id", ignoreDuplicates: true },
      )
    } catch {
      // Service role key not configured in this environment. The database
      // trigger (see supabase/profiles.sql) covers profile creation instead.
    }
  }

  return {
    success: true,
    email,
    needsConfirmation: !data.user?.email_confirmed_at,
  }
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const password = (formData.get("password") as string | null) ?? ""

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: error.message }
  }

  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut()
    return { success: false, error: "Please confirm your email address before signing in." }
  }

  const role = data.user ? await roleFor(data.user.id) : null
  redirect(landingFor(role))
}

export async function adminSignInAction(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const password = (formData.get("password") as string | null) ?? ""

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: error.message }
  }

  const role = data.user ? await roleFor(data.user.id) : null

  if (role !== "admin") {
    await supabase.auth.signOut()
    return { success: false, error: "This account does not have admin access." }
  }

  redirect("/admin/dashboard")
}

export async function signOutAction() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
