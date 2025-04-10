import { NextResponse } from "next/server"
import { initSupabaseAdmin, safeCheckStorageBucket, safeCheckFolder } from "@/lib/supabase-server"

// In a real app, you would have a separate "trash" folder or a database flag
// For this demo, we'll simulate trash by moving files to a "trash" folder
const TRASH_FOLDER = "trash"

export async function GET() {
  try {
    // Initialize Supabase client
    let supabase
    try {
      supabase = await initSupabaseAdmin()
    } catch (initError: any) {
      console.error("Error initializing Supabase client:", initError)
      return NextResponse.json(
        { files: [], error: `Failed to initialize Supabase client: ${initError.message}` },
        { status: 200 },
      )
    }

    // Check if the storage bucket exists
    const bucketCheck = await safeCheckStorageBucket(supabase, "files")
    if (!bucketCheck.success) {
      console.error("Bucket error:", bucketCheck.error)
      return NextResponse.json({ files: [], error: bucketCheck.error }, { status: 200 })
    }

    // Check if trash folder exists, if not create it
    try {
      const { data: folderExists, error: folderError } = await supabase.storage.from("files").list(TRASH_FOLDER)

      if (folderError && folderError.message.includes("The resource was not found")) {
        // Create trash folder
        await supabase.storage.from("files").upload(`${TRASH_FOLDER}/.keep`, new Blob([""]))
      }
    } catch (error) {
      console.error("Error checking/creating trash folder:", error)
      // Continue anyway
    }

    // Get files from trash folder
    const folderCheck = await safeCheckFolder(supabase, "files", TRASH_FOLDER)
    if (!folderCheck.success) {
      console.error("Folder error:", folderCheck.error)
      return NextResponse.json({ files: [], error: folderCheck.error }, { status: 200 })
    }

    const data = folderCheck.data

    // Filter out the .keep file
    const files = data
      .filter((file: any) => file.name !== ".keep")
      .map((file: any) => ({
        id: file.name,
        name: file.name.split("-").pop() || file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype,
        deleted_at: file.created_at || new Date().toISOString(),
      }))

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error("Error fetching trash files:", error)
    return NextResponse.json(
      { files: [], error: `Error fetching trash files: ${error.message || "Unknown error"}` },
      { status: 200 },
    )
  }
}
