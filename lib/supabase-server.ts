import { createClient } from "@supabase/supabase-js"

export async function initSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  }

  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      fetch: fetch,
    },
  })
}

// This function will attempt to check the bucket but will not throw an error
// Instead, it will return a status object
export async function safeCheckStorageBucket(supabase: any, bucketName = "files") {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return {
        success: false,
        error: `Error listing buckets: ${bucketsError.message}`,
        details: bucketsError,
      }
    }

    const bucket = buckets.find((b: any) => b.name === bucketName)
    if (!bucket) {
      return {
        success: false,
        error: `The '${bucketName}' bucket does not exist. Please create it in your Supabase dashboard.`,
      }
    }

    return {
      success: true,
      bucket,
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Error checking storage bucket: ${error.message}`,
      details: error,
    }
  }
}

// This function will attempt to check the folder but will not throw an error
export async function safeCheckFolder(supabase: any, bucketName: string, folderPath: string) {
  try {
    // Try to list the folder
    const { data, error } = await supabase.storage.from(bucketName).list(folderPath)

    if (error) {
      if (error.message.includes("does not exist")) {
        return {
          success: false,
          error: `The '${folderPath}' folder does not exist in the '${bucketName}' bucket. Please create it.`,
        }
      }
      return {
        success: false,
        error: `Error checking folder: ${error.message}`,
        details: error,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Error checking folder: ${error.message}`,
      details: error,
    }
  }
}
