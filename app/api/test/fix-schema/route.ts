import { NextResponse, NextRequest } from "next/server"
import { supabase } from "@/lib/supabase"

// This API route fixes the database schema for file_metadata table
export async function GET(request: NextRequest) {
  // Basic security check - only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      success: false, 
      message: "This endpoint is only available in development mode" 
    }, { status: 403 })
  }
  
  try {
    console.log("Starting database schema repair...");
    
    // Check if table exists first
    const { data: checkTable, error: checkError } = await supabase
      .from("file_metadata")
      .select("count(*)")
      .limit(1);
      
    if (checkError && checkError.message.includes("does not exist")) {
      // If table doesn't exist, create it with all required columns
      console.log("Table doesn't exist, creating it from scratch");
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
        
        // Force refresh the schema cache
        await refreshSchemaCache();
        
        return NextResponse.json({
          success: true,
          message: "Created new file_metadata table with all required columns",
          operations: ["create_table"]
        });
      } catch (createError: any) {
        console.error("Error creating table:", createError);
        return NextResponse.json({
          success: false,
          message: "Failed to create table",
          error: createError
        }, { status: 500 });
      }
    }
    
    // If we're here, the table exists but might be missing columns
    // Let's check for missing columns and add them
    
    const operations = [];
    
    // Try to add original_name column
    try {
      await supabase.rpc("exec_sql", {
        sql_query: "ALTER TABLE public.file_metadata ADD COLUMN IF NOT EXISTS original_name TEXT;"
      });
      operations.push("added_original_name");
      console.log("Added original_name column");
    } catch (error: any) {
      console.error("Error adding original_name column:", error);
    }
    
    // Try to add size column
    try {
      await supabase.rpc("exec_sql", {
        sql_query: "ALTER TABLE public.file_metadata ADD COLUMN IF NOT EXISTS size BIGINT;"
      });
      operations.push("added_size");
      console.log("Added size column");
    } catch (error: any) {
      console.error("Error adding size column:", error);
    }
    
    // Try to add type column
    try {
      await supabase.rpc("exec_sql", {
        sql_query: "ALTER TABLE public.file_metadata ADD COLUMN IF NOT EXISTS type TEXT;"
      });
      operations.push("added_type");
      console.log("Added type column");
    } catch (error: any) {
      console.error("Error adding type column:", error);
    }
    
    // Try to add uploader_ip column
    try {
      await supabase.rpc("exec_sql", {
        sql_query: "ALTER TABLE public.file_metadata ADD COLUMN IF NOT EXISTS uploader_ip TEXT;"
      });
      operations.push("added_uploader_ip");
      console.log("Added uploader_ip column");
    } catch (error: any) {
      console.error("Error adding uploader_ip column:", error);
    }
    
    // Try to add encryption_enabled column
    try {
      await supabase.rpc("exec_sql", {
        sql_query: "ALTER TABLE public.file_metadata ADD COLUMN IF NOT EXISTS encryption_enabled BOOLEAN DEFAULT false;"
      });
      operations.push("added_encryption_enabled");
      console.log("Added encryption_enabled column");
    } catch (error: any) {
      console.error("Error adding encryption_enabled column:", error);
    }
    
    // Force Supabase to refresh its schema cache after making changes
    await refreshSchemaCache();
    
    return NextResponse.json({
      success: true,
      message: "Schema update complete",
      operations: operations
    });
    
  } catch (error: any) {
    console.error("Error fixing schema:", error);
    return NextResponse.json({
      success: false,
      message: "Error fixing schema",
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}

// Helper function to refresh Supabase's schema cache
async function refreshSchemaCache() {
  try {
    console.log("Refreshing schema cache...");
    
    // This is a workaround to clear PostgREST's schema cache
    // We'll do a simple SELECT query with a random table name, forcing a cache refresh
    await supabase.rpc("exec_sql", {
      sql_query: "SELECT 1; -- Force schema cache refresh"
    });
    
    // Now query the updated table to force a refresh
    await supabase.from("file_metadata").select("count(*)").limit(1);
    
    console.log("Schema cache refreshed");
  } catch (error) {
    console.error("Error refreshing schema cache:", error);
  }
} 