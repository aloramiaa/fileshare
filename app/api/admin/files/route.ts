import { NextResponse } from "next/server"
import { getFileUrl } from "@/lib/file-utils"
import { initSupabaseAdmin, safeCheckStorageBucket, safeCheckFolder } from "@/lib/supabase-server"

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

    // Check if the uploads folder exists
    const folderCheck = await safeCheckFolder(supabase, "files", "uploads")
    if (!folderCheck.success) {
      console.error("Folder error:", folderCheck.error)
      return NextResponse.json({ files: [], error: folderCheck.error }, { status: 200 })
    }

    const data = folderCheck.data

    // Process file data
    const fileObjects = await Promise.all(
      data.map(async (file: any) => {
        // Get public URL from Supabase
        const { data: urlData } = supabase.storage.from("files").getPublicUrl(`uploads/${file.name}`)

        // Use our custom URL instead of direct Supabase URL
        const fileUrl = getFileUrl(file.name)

        // Try to extract original filename from the UUID filename
        const originalName = file.name.split("-").pop() || file.name

        return {
          name: file.name,
          id: file.name,
          created_at: file.created_at || new Date().toISOString(),
          size: file.metadata?.size || 0,
          url: fileUrl,
          type: file.metadata?.mimetype,
          originalName,
        }
      }),
    )

    return NextResponse.json({ files: fileObjects })
  } catch (error: any) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { files: [], error: `Error fetching files: ${error.message || "Unknown error"}` },
      { status: 200 },
    )
  }
}
