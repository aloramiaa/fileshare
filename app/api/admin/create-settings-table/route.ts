import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST() {
  try {
    // First, check if the function exists
    const { data: functionExists, error: functionCheckError } = await supabase
      .rpc("function_exists", {
        function_name: "create_settings_table",
      })
      .single()

    // If the function doesn't exist or we couldn't check, create it
    if (functionCheckError || !functionExists || !functionExists.exists) {
      console.log("Creating create_settings_table function...")

      // Create the function to create the settings table
      const { error: createFunctionError } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE OR REPLACE FUNCTION create_settings_table()
          RETURNS void AS $$
          BEGIN
            -- Check if the table already exists
            IF NOT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'settings'
            ) THEN
              -- Create the settings table
              CREATE TABLE public.settings (
                id SERIAL PRIMARY KEY,
                key TEXT NOT NULL UNIQUE,
                value JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              -- Add RLS policies
              ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
              
              -- Create policy for full access (in a real app, you'd restrict this)
              CREATE POLICY "Allow full access to all users" 
                ON public.settings 
                USING (true) 
                WITH CHECK (true);
            END IF;
          END;
          $$ LANGUAGE plpgsql;
        `,
      })

      if (createFunctionError) {
        console.error("Error creating function:", createFunctionError)

        // Try direct table creation as fallback
        const { error: directCreateError } = await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.settings (
              id SERIAL PRIMARY KEY,
              key TEXT NOT NULL UNIQUE,
              value JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Add RLS policies
            ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
            
            -- Create policy for full access (in a real app, you'd restrict this)
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

        if (directCreateError) {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to create settings table directly",
              error: directCreateError,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: "Settings table created directly (function creation failed)",
        })
      }
    }

    // Now call the function to create the table
    const { error } = await supabase.rpc("create_settings_table")

    if (error) {
      console.error("Error creating settings table:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create settings table",
          error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, message: "Settings table created successfully" })
  } catch (error) {
    console.error("Error creating settings table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create settings table",
        error,
      },
      { status: 500 },
    )
  }
}

// Helper function to check if a function exists
export async function GET() {
  try {
    // Create the function_exists function if it doesn't exist
    const { error: createFunctionError } = await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE OR REPLACE FUNCTION function_exists(function_name TEXT)
        RETURNS TABLE(exists BOOLEAN) AS $$
        BEGIN
          RETURN QUERY
          SELECT EXISTS (
            SELECT FROM pg_proc
            WHERE proname = function_name
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    if (createFunctionError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create function_exists function",
          error: createFunctionError,
        },
        { status: 500 },
      )
    }

    // Create the exec_sql function if it doesn't exist
    const { error: createExecSqlError } = await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
    })

    if (createExecSqlError) {
      // If we can't create the function, it might already exist
      return NextResponse.json({
        success: true,
        message: "exec_sql function may already exist",
        error: createExecSqlError,
      })
    }

    return NextResponse.json({ success: true, message: "Helper functions created successfully" })
  } catch (error) {
    console.error("Error creating helper functions:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create helper functions",
        error,
      },
      { status: 500 },
    )
  }
}
