import { NextResponse, NextRequest } from "next/server"
import { supabase, ensureTableExists } from "@/lib/supabase"
import { getPublicIp } from "@/lib/ip-utils"

export async function GET(request: NextRequest) {
  try {
    // Get public IP using our helper function
    const requestIp = await getPublicIp(request);
    
    console.log("Files request from client");
    
    // Make sure the file_metadata table exists
    console.log("Ensuring required tables exist");
    const tableCreated = await ensureTableExists(
      "file_metadata", 
      "CREATE TABLE IF NOT EXISTS public.file_metadata (id SERIAL PRIMARY KEY, file_id TEXT NOT NULL UNIQUE, original_name TEXT, size BIGINT, type TEXT, password_protected BOOLEAN DEFAULT false, password TEXT, encryption_enabled BOOLEAN DEFAULT false, expiry_enabled BOOLEAN DEFAULT false, expiry_date TIMESTAMP WITH TIME ZONE, uploader_ip TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());"
    )
    console.log("Table verification complete");
    
    // Fetch files filtered by IP
    console.log("Fetching user files");
    const { data: files, error } = await supabase
      .from("file_metadata")
      .select("*")
      .eq("uploader_ip", requestIp)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching files");
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to fetch files by IP", 
          error: error,
          details: {
            code: error.code,
            message: error.message,
            hint: error.hint || null
          }
        },
        { status: 500 }
      )
    }

    console.log(`Found ${files ? files.length : 0} files for user`);

    // Return only the user's own uploads
    return NextResponse.json({
      success: true,
      message: "Files retrieved successfully",
      data: files || [],
      ip: requestIp
    })
  } catch (error: any) {
    console.error("Error in GET /api/files");
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        error: {
          message: error.message
        }
      },
      { status: 500 }
    )
  }
} 