import { NextRequest, NextResponse } from "next/server"
import { supabase, ensureTableExists } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import CryptoJS from "crypto-js"
import { getPublicIp } from "@/lib/ip-utils"

export async function POST(request: NextRequest) {
  try {
    // Get user's IP using our helper function
    const uploaderIp = await getPublicIp(request);
    
    console.log("Upload request received");
    
    // Make sure the file_metadata table exists
    await ensureTableExists(
      "file_metadata", 
      "CREATE TABLE IF NOT EXISTS public.file_metadata (id SERIAL PRIMARY KEY, file_id TEXT NOT NULL UNIQUE, original_name TEXT, size BIGINT, type TEXT, password_protected BOOLEAN DEFAULT false, password TEXT, encryption_enabled BOOLEAN DEFAULT false, expiry_enabled BOOLEAN DEFAULT false, expiry_date TIMESTAMP WITH TIME ZONE, uploader_ip TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());"
    )
    
    const formData = await request.formData()
    const file = formData.get("file") as File
    const password = formData.get("password") as string
    const encrypt = formData.get("encrypt") as string
    const expiry = formData.get("expiry") as string

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      )
    }

    // Generate unique file ID with original name for better identification
    const fileExtension = file.name.split(".").pop() || ""
    const fileName = file.name.split(".").slice(0, -1).join(".")
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
    const fileId = `${uuidv4()}-${sanitizedName}`
    
    // Process file content based on encryption setting
    let fileBuffer: ArrayBuffer | null = null
    let fileData = null

    if (encrypt === "true" && process.env.NEXT_PUBLIC_CRYPTO_KEY) {
      // Encrypt the file if encryption is enabled
      fileBuffer = await file.arrayBuffer()
      const fileBytes = new Uint8Array(fileBuffer)
      const fileContent = String.fromCharCode.apply(null, Array.from(fileBytes))
      
      // Encrypt with AES using environment variable key
      const encryptedData = CryptoJS.AES.encrypt(
        fileContent,
        process.env.NEXT_PUBLIC_CRYPTO_KEY
      ).toString()
      
      // Convert encrypted string back to Blob for upload
      fileData = new Blob([encryptedData], { type: "application/octet-stream" })
    } else {
      // Use original file if no encryption
      fileData = file
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(`uploads/${fileId}`, fileData, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file")
      return NextResponse.json(
        { success: false, message: "Failed to upload file" },
        { status: 500 }
      )
    }

    // Store metadata in database
    console.log("Storing file metadata");
    const { data: metadataData, error: metadataError } = await supabase
      .from("file_metadata")
      .insert([
        {
          file_id: fileId,
          original_name: file.name,
          size: file.size,
          type: file.type,
          password_protected: password ? true : false,
          password: password || null,
          encryption_enabled: encrypt === "true",
          expiry_enabled: expiry ? true : false,
          expiry_date: expiry || null,
          uploader_ip: uploaderIp,
        },
      ])
      .select()

    if (metadataError) {
      console.error("Error storing file metadata")
      // Delete the uploaded file if metadata storage fails
      await supabase.storage.from("files").remove([`uploads/${fileId}`])
      
      return NextResponse.json(
        { success: false, message: "Failed to store file metadata" },
        { status: 500 }
      )
    }

    // Return success with file ID
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: fileId,
        url: `/file/${fileId}`,
      },
    })
  } catch (error) {
    console.error("Error in upload route")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle file size limits
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "50mb",
  },
} 