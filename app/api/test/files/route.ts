import { NextResponse, NextRequest } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// This is a test API route that can be used to add sample file entries
// for testing purposes only - should be removed in production

export async function POST(request: NextRequest) {
  // Basic security check - only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      success: false, 
      message: "This endpoint is only available in development mode" 
    }, { status: 403 })
  }
  
  try {
    // Get IP from x-forwarded-for header or default to unknown
    const requestIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    console.log("Creating test file for IP:", requestIp)
    
    // First ensure the table has the required columns
    const tableFixed = await fixTableStructure();
    if (!tableFixed.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fix table structure",
        error: tableFixed.error
      }, { status: 500 });
    }
    
    // Create a random test file entry in the database
    const fileId = `test-${uuidv4()}`
    const fileName = `test-file-${Date.now()}.txt`
    
    // Try to insert test file
    try {
      const { data, error } = await supabase
        .from("file_metadata")
        .insert([
          {
            file_id: fileId,
            original_name: fileName,
            size: 1024,
            type: "text/plain",
            password_protected: false,
            encryption_enabled: false,
            expiry_enabled: false,
            uploader_ip: requestIp,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
      
      if (error) {
        console.error("Error creating test file:", error)
        return NextResponse.json({ 
          success: false, 
          message: "Failed to create test file",
          error
        }, { status: 500 })
      }
      
      console.log("Test file created successfully:", data)
      
      return NextResponse.json({
        success: true,
        message: "Test file created successfully",
        data: {
          file_id: fileId,
          file_name: fileName,
        },
      })
    } catch (insertError: any) {
      console.error("Error inserting test file:", insertError);
      return NextResponse.json({ 
        success: false, 
        message: "Error inserting test file",
        error: insertError
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in test file creation:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create test file",
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 })
  }
}

// Helper function to fix table structure
async function fixTableStructure() {
  try {
    console.log("Fixing table structure...");
    
    // Check if the file_metadata table exists
    const { error: tableCheckError } = await supabase
      .from("file_metadata")
      .select("count(*)")
      .limit(1);
    
    // If table doesn't exist, create it
    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      try {
        await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.file_metadata (
              id SERIAL PRIMARY KEY,
              file_id TEXT NOT NULL UNIQUE,
              original_name TEXT,
              size BIGINT,
              type TEXT,
              password_protected BOOLEAN DEFAULT false,
              password TEXT,
              encryption_enabled BOOLEAN DEFAULT false,
              expiry_enabled BOOLEAN DEFAULT false,
              expiry_date TIMESTAMP WITH TIME ZONE,
              uploader_ip TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Allow full access to all users" ON public.file_metadata
              FOR ALL USING (true) WITH CHECK (true);
          `
        });
        console.log("Created file_metadata table");
      } catch (createError: any) {
        console.error("Error creating table:", createError);
        return { success: false, error: createError };
      }
    } else {
      console.log("Table exists, checking columns...");
      
      // Table exists, add any missing columns
      const columnsToAdd = [
        { name: "original_name", type: "TEXT" },
        { name: "size", type: "BIGINT" },
        { name: "type", type: "TEXT" },
        { name: "uploader_ip", type: "TEXT" },
        { name: "encryption_enabled", type: "BOOLEAN DEFAULT false" },
      ];
      
      // Add each column if it doesn't exist
      for (const col of columnsToAdd) {
        try {
          await supabase.rpc("exec_sql", {
            sql_query: `ALTER TABLE public.file_metadata ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
          });
          console.log(`Added column ${col.name} if it didn't exist`);
        } catch (error: any) {
          console.error(`Error adding column ${col.name}:`, error);
        }
      }
    }
    
    // Force a schema cache refresh
    try {
      console.log("Forcing schema cache refresh...");
      
      // Execute a harmless query to refresh the schema cache
      await supabase.rpc("exec_sql", {
        sql_query: "SELECT 1; -- Forcing schema cache refresh"
      });
      
      // Query the table to ensure cache is refreshed
      await supabase.from("file_metadata").select("count(*)").limit(1);
      
      console.log("Schema cache refreshed");
    } catch (refreshError: any) {
      console.error("Error refreshing schema cache:", refreshError);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error fixing table structure:", error);
    return { success: false, error };
  }
} 