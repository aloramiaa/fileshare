import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client (only create one instance)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single instance of Supabase client to be used app-wide
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

// Helper function to check if a table exists and create it if needed
export async function ensureTableExists(tableName: string, createTableSql: string) {
  try {
    // Try a simple query to check if the table exists
    const { data: tableCheck, error: tableCheckError } = await supabase
      .from(tableName)
      .select('count(*)')
      .limit(1)
    
    // If there's an error about the table not existing, create it
    if (tableCheckError && tableCheckError.message && 
        (tableCheckError.message.includes('relation') || tableCheckError.message.includes('does not exist'))) {
      console.log(`Table ${tableName} doesn't exist, creating it...`)
      
      // Create the table with the provided SQL
      try {
        await supabase.rpc('exec_sql', {
          sql_query: createTableSql
        })
        
        // Enable RLS
        await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`
        })
        
        // Add a permissive policy
        await supabase.rpc('exec_sql', {
          sql_query: `CREATE POLICY "Allow full access to all users" ON public.${tableName} FOR ALL USING (true) WITH CHECK (true);`
        })
        
        console.log(`Table ${tableName} created successfully`)
        return true
      } catch (createError: any) {
        console.error(`Error creating table ${tableName}:`, createError)
        return false
      }
    }
    
    // Table exists
    return true
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
} 