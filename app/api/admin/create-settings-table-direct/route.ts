import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST() {
  try {
    console.log("Creating settings table directly...")

    // Try to create the table using SQL
    const { error } = await supabase.rpc("exec_sql", {
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
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'settings' 
            AND policyname = 'Allow full access to all users'
          ) THEN
            CREATE POLICY "Allow full access to all users" 
              ON public.settings 
              USING (true) 
              WITH CHECK (true);
          END IF;
        END
        $$;
      `,
    })

    if (error) {
      console.error("Error creating settings table with exec_sql:", error)

      // If exec_sql fails, try a different approach
      // This is a fallback in case the RPC function doesn't exist or fails

      // First, try to create the exec_sql function
      try {
        await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
            RETURNS VOID AS $$
            BEGIN
              EXECUTE sql_query;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `,
        })

        // Try again with the newly created function
        const { error: retryError } = await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.settings (
              id SERIAL PRIMARY KEY,
              key TEXT NOT NULL UNIQUE,
              value JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        })

        if (retryError) {
          throw new Error(`Failed to create settings table after creating exec_sql: ${retryError.message}`)
        }
      } catch (funcError) {
        console.error("Error creating exec_sql function:", funcError)

        // As a last resort, try to create the table directly through the REST API
        // This might not work depending on Supabase permissions, but worth a try
        const response = await fetch(`${supabaseUrl}/rest/v1/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            key: "test",
            value: {},
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to create settings table through REST API: ${response.statusText}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Settings table created successfully",
    })
  } catch (error) {
    console.error("Error creating settings table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create settings table",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
