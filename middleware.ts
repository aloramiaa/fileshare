import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the request is for the admin section
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip the login page itself from the middleware check
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next()
    }

    // Check if the user is authenticated
    const isAuthenticated = request.cookies.get("admin_authenticated")
    console.log("Auth cookie:", isAuthenticated) // Add logging for debugging

    // If not authenticated, redirect to login
    if (!isAuthenticated || isAuthenticated.value !== "true") {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
