import { NextResponse, NextRequest } from "next/server"
import { supabase, ensureTableExists } from "@/lib/supabase"

// Store file metadata
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { id, passwordProtected, password, expiryEnabled, expiryDate } = data

    if (!id) {
      return NextResponse.json({ success: false, message: "File ID is required" }, { status: 400 })
    }

    // Ensure the file_metadata table exists
    await ensureTableExists(
      "file_metadata",
      "CREATE TABLE IF NOT EXISTS public.file_metadata (id SERIAL PRIMARY KEY, file_id TEXT NOT NULL UNIQUE, original_name TEXT, size BIGINT, type TEXT, password_protected BOOLEAN DEFAULT false, password TEXT, encryption_enabled BOOLEAN DEFAULT false, expiry_enabled BOOLEAN DEFAULT false, expiry_date TIMESTAMP WITH TIME ZONE, uploader_ip TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());"
    )

    // Create or update file metadata in Supabase
    console.log("Inserting file metadata for:", id);
    const { error } = await supabase.from("file_metadata").upsert(
      {
        file_id: id,
        password_protected: passwordProtected,
        password: password, // In production, this should be hashed
        expiry_enabled: expiryEnabled,
        expiry_date: expiryDate,
        created_at: new Date().toISOString(),
      },
      { onConflict: "file_id" }
    )

    if (error) {
      console.error("Supabase error details:", JSON.stringify(error, null, 2));
      const errorMessage = error.message || "Unknown database error";
      
      // Log detailed error info but return a simpler message to the client
      return NextResponse.json({ 
        success: false, 
        message: errorMessage,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Metadata stored successfully" })
  } catch (error: any) {
    console.error("Error in metadata API:", error);
    return NextResponse.json({ 
      success: false, 
      message: error?.message || "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}

// Get file metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("id")
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      )
    }
    
    // Get the user's IP address
    const requestIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Get file metadata
    const { data, error } = await supabase
      .from("file_metadata")
      .select("*")
      .eq("file_id", fileId)
      .single()

    if (error) {
      console.error("Error fetching file metadata:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch file metadata" },
        { status: 500 }
      )
    }

    // If no data found
    if (!data) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      )
    }

    // Only return sensitive metadata if it's the uploader's IP address
    // or if the file is public (not password protected)
    if (data.uploader_ip === requestIp || !data.password_protected) {
      // Return full metadata
      return NextResponse.json({
        success: true,
        message: "File metadata retrieved successfully",
        data: {
          file_id: data.file_id,
          original_name: data.original_name,
          size: data.size,
          type: data.type,
          password_protected: data.password_protected,
          encryption_enabled: data.encryption_enabled,
          expiry_enabled: data.expiry_enabled,
          expiry_date: data.expiry_date,
          created_at: data.created_at,
        },
      })
    } else {
      // Return limited metadata for non-owners
      // Important: Never expose password in the response
      return NextResponse.json({
        success: true,
        message: "File metadata retrieved successfully",
        data: {
          file_id: data.file_id,
          password_protected: data.password_protected,
          encryption_enabled: data.encryption_enabled,
          type: data.type,
        },
        isOwner: false,
      })
    }
  } catch (error) {
    console.error("Error in GET /api/files/metadata:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Verify password for file access
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id: fileId, password } = body
    
    if (!fileId || !password) {
      return NextResponse.json(
        { success: false, message: "File ID and password are required" },
        { status: 400 }
      )
    }
    
    // Get file metadata
    const { data, error } = await supabase
      .from("file_metadata")
      .select("password")
      .eq("file_id", fileId)
      .single()
    
    if (error) {
      console.error("Error fetching file password:", error)
      return NextResponse.json(
        { success: false, message: "Failed to verify password" },
        { status: 500 }
      )
    }
    
    // Check if the password matches
    const authenticated = data?.password === password
    
    return NextResponse.json({
      success: true,
      authenticated,
      message: authenticated ? "Password verified successfully" : "Incorrect password",
    })
  } catch (error) {
    console.error("Error in PUT /api/files/metadata:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 