import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient as createSsrClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Request-scoped Supabase client for server components, server actions and
 * route handlers. Reads and writes the auth session through cookies so a
 * signed in user stays signed in across requests.
 */
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.")
  }

  const cookieStore = cookies()

  return createSsrClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a server component that cannot set cookies. The
          // middleware refreshes the session instead, so this is safe to skip.
        }
      },
    },
  })
}

/**
 * Service role client for privileged operations such as creating users from
 * the admin console. Never import this from a client component.
 */
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.")
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
