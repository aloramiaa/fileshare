import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    // Get auto-delete setting
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "storage")
      .single()

    if (settingsError) {
      console.error("Error fetching settings:", settingsError)
      return NextResponse.json({ success: false, error: settingsError.message }, { status: 500 })
    }

    const autoDeleteDays = settingsData?.value?.autoDeleteDays || 0

    // If auto-delete is disabled (0 days), do nothing
    if (autoDeleteDays <= 0) {
      return NextResponse.json({ success: true, message: "Auto-delete is disabled" })
    }

    // List all files
    const { data: files, error: filesError } = await supabase.storage.from("files").list("uploads")

    if (filesError) {
      console.error("Error listing files:", filesError)
      return NextResponse.json({ success: false, error: filesError.message }, { status: 500 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ success: true, message: "No files to process" })
    }

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - autoDeleteDays)

    // Filter files older than cutoff date
    const filesToDelete = files.filter((file) => {
      const fileDate = new Date(file.created_at || "")
      return fileDate < cutoffDate
    })

    if (filesToDelete.length === 0) {
      return NextResponse.json({ success: true, message: "No files to delete" })
    }

    // Delete files
    const filePaths = filesToDelete.map((file) => `uploads/${file.name}`)
    const { error: deleteError } = await supabase.storage.from("files").remove(filePaths)

    if (deleteError) {
      console.error("Error deleting files:", deleteError)
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
    }

    // Log deletion for audit purposes
    console.log(`Auto-deleted ${filesToDelete.length} files older than ${autoDeleteDays} days`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${filesToDelete.length} files older than ${autoDeleteDays} days`,
      deletedFiles: filesToDelete.map((f) => f.name),
    })
  } catch (error: any) {
    console.error("Unhandled error in auto-delete:", error)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 })
  }
}
