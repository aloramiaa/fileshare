import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Correctly handle params, ensuring it's properly handled as dynamic param
    const fileId = params.id
    
    if (!fileId) {
      return new NextResponse("File ID is required", { status: 400 })
    }

    // Check if the file is password protected
    const { data: metadata, error: metadataError } = await supabase
      .from("file_metadata")
      .select("password_protected, password")
      .eq("file_id", fileId)
      .single()

    // If we found metadata and the file is password protected
    if (metadata && metadata.password_protected) {
      // Check for auth cookie or query param
      const authToken = request.cookies.get('file_auth_' + fileId)?.value
      const queryToken = request.nextUrl.searchParams.get('token')

      // If no auth token is provided or it doesn't match the password
      if ((!authToken || authToken !== metadata.password) && 
          (!queryToken || queryToken !== metadata.password)) {
        // Redirect to the file view page which will handle password entry
        return NextResponse.redirect(new URL(`/file/${fileId}`, request.url))
      }
    }

    // If we get here, either the file is not password protected or auth is valid,
    // so we proceed with serving the file

    // Get file data from Supabase
    const { data: fileData, error: fileError } = await supabase.storage.from("files").download(`uploads/${fileId}`)

    if (fileError || !fileData) {
      console.error("Error fetching file:", fileError)
      return new NextResponse("File not found", { status: 404 })
    }

    // Get file metadata to determine content type
    const { data: urlData } = supabase.storage.from("files").getPublicUrl(`uploads/${fileId}`)

    // Fetch headers from the original file to get content-type
    const response = await fetch(urlData.publicUrl, { method: "HEAD" })
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Convert file data to array buffer
    const arrayBuffer = await fileData.arrayBuffer()

    // Return the file with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileId}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return new NextResponse("Error serving file", { status: 500 })
  }
}
