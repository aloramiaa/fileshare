import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST() {
  try {
    // Check if settings table exists
    const { error: tableError } = await supabase.from("settings").select("*").limit(1)

    // If table doesn't exist or there's an error, create it
    if (tableError) {
      console.log("Settings table error:", tableError.message)

      // Create the table using SQL
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql_query: `
          -- Create the settings table if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.settings (
            id SERIAL PRIMARY KEY,
            key TEXT NOT NULL UNIQUE,
            value JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add RLS policies if they don't exist
          ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
          
          -- Check if policy exists before creating it
          DO $
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_policies 
              WHERE tablename = 'settings' 
              AND policyname = 'Allow full access to all users'
            ) THEN
              CREATE POLICY "Allow full access to all users" 
                ON public.settings 
                FOR ALL
                USING (true) 
                WITH CHECK (true);
            END IF;
          END
          $;
        `,
      })

      if (createError) {
        console.error("Error creating settings table:", createError)
        return NextResponse.json(
          { success: false, message: "Failed to create settings table", error: createError },
          { status: 500 },
        )
      }

      // Insert default settings
      const defaultSettings = [
        {
          key: "storage",
          value: {
            maxFileSize: 100,
            allowedFileTypes: "*",
            autoDeleteDays: 0,
          },
        },
        {
          key: "security",
          value: {
            publicAccess: true,
            requirePassword: false,
            enableEncryption: false,
          },
        },
        {
          key: "display",
          value: {
            siteName: "FileShare",
            siteDescription: "Simple & Fast File Sharing",
            primaryColor: "#0070f3",
          },
        },
      ]

      for (const setting of defaultSettings) {
        const { error: insertError } = await supabase.from("settings").insert([setting])
        if (insertError) {
          console.error(`Error inserting ${setting.key} settings:`, insertError)
        }
      }
    }

    return NextResponse.json({ success: true, message: "Settings initialized successfully" })
  } catch (error) {
    console.error("Error initializing settings:", error)
    return NextResponse.json({ success: false, message: "Failed to initialize settings", error }, { status: 500 })
  }
}
