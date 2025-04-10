import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// The password is "TooDear@Alora"
// Let's use a direct string comparison instead of bcrypt for simplicity
const ADMIN_PASSWORD = "TooDear@Alora"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Check if password is correct using direct comparison
    const isPasswordValid = password === ADMIN_PASSWORD

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 })
    }

    // Set a cookie to indicate the user is authenticated
    // Use more secure settings and a longer expiration
    const cookieStore = cookies()
    cookieStore.set("admin_authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during authentication" }, { status: 500 })
  }
}
