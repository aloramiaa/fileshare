import { NextResponse } from "next/server"
import { initSupabaseAdmin, safeCheckStorageBucket, safeCheckFolder } from "@/lib/supabase-server"

export async function GET() {
  try {
    // Initialize Supabase client
    let supabase
    try {
      supabase = await initSupabaseAdmin()
    } catch (initError: any) {
      console.error("Error initializing Supabase client:", initError)
      // Return fallback data with error message
      return NextResponse.json({
        totalFiles: 0,
        totalStorage: 0,
        recentUploads: 0,
        fileTypes: {},
        error: `Failed to initialize Supabase client: ${initError.message}`,
      })
    }

    // Check if the storage bucket exists
    const bucketCheck = await safeCheckStorageBucket(supabase, "files")
    if (!bucketCheck.success) {
      console.error("Bucket error:", bucketCheck.error)
      // Return fallback data with error message
      return NextResponse.json({
        totalFiles: 0,
        totalStorage: 0,
        recentUploads: 0,
        fileTypes: {},
        error: bucketCheck.error,
      })
    }

    // Check if the uploads folder exists
    const folderCheck = await safeCheckFolder(supabase, "files", "uploads")
    if (!folderCheck.success) {
      console.error("Folder error:", folderCheck.error)
      // Return fallback data with error message
      return NextResponse.json({
        totalFiles: 0,
        totalStorage: 0,
        recentUploads: 0,
        fileTypes: {},
        error: folderCheck.error,
      })
    }

    const data = folderCheck.data

    // Calculate stats
    let totalSize = 0
    const fileTypes: Record<string, number> = {}
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    let recentCount = 0

    data.forEach((file: any) => {
      // Add to total size
      totalSize += file.metadata?.size || 0

      // Count file types
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "unknown"
      fileTypes[fileExt] = (fileTypes[fileExt] || 0) + 1

      // Count recent uploads
      if (file.created_at) {
        const createdDate = new Date(file.created_at)
        if (createdDate > lastWeek) {
          recentCount++
        }
      }
    })

    return NextResponse.json({
      totalFiles: data.length,
      totalStorage: totalSize,
      recentUploads: recentCount,
      fileTypes,
    })
  } catch (error: any) {
    console.error("Unhandled error in stats API:", error)
    // Return fallback data with error message
    return NextResponse.json({
      totalFiles: 0,
      totalStorage: 0,
      recentUploads: 0,
      fileTypes: {},
      error: `Unhandled error in stats API: ${error.message || "Unknown error"}`,
    })
  }
}
