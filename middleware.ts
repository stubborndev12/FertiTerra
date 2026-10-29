import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/** Routes that need a signed in user, and the admin area that needs an admin. */
const PROTECTED = ["/dashboard", "/profile"]
const ADMIN_OPEN = ["/admin/login"]

function isAdminPath(path: string) {
  return path.startsWith("/admin") && !ADMIN_OPEN.some((open) => path.startsWith(open))
}

/**
 * Refreshes the Supabase auth session on every request, keeps the auth cookies
 * in sync, and sends visitors away from areas they are not allowed to see.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const needsUser = PROTECTED.some((route) => path.startsWith(route)) || isAdminPath(path)

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ""
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (!user && needsUser) {
    const url = request.nextUrl.clone()
    url.pathname = isAdminPath(path) ? "/admin/login" : "/login"
    url.search = ""
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (user && isAdminPath(path)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      return redirectTo("/dashboard")
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
