import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the authentication cookie
  cookies().set("admin_authenticated", "", {
    expires: new Date(0),
    path: "/",
  })

  return NextResponse.json({ success: true })
}
