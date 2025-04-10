"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { FileIcon, Copy, ExternalLink, Calendar, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getFileUrl, formatFileSize, formatDate } from "@/lib/file-utils"
import { useRouter } from "next/navigation"

// Initialize Supabase client
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
// const supabase = createClient(supabaseUrl, supabaseAnonKey)

type FileObject = {
  name: string
  id: string
  created_at: string
  size: number
  url: string
  type?: string
}

interface RecentFilesProps {
  limit?: number
}

export default function RecentFiles({ limit = 10 }: RecentFilesProps) {
  const [files, setFiles] = useState<FileObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchRecentFiles() {
      try {
        // Initialize Supabase client inside the function
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase environment variables")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // List files from the 'files' bucket
        const { data, error } = await supabase.storage.from("files").list("uploads", {
          limit: limit,
          sortBy: { column: "created_at", order: "desc" },
        })

        if (error) {
          console.error("Storage error:", error)

          if (error.message.includes("row-level security policy")) {
            setError("Storage permission denied. Please configure your Supabase storage bucket permissions.")
          } else if (error.message.includes("The resource was not found")) {
            setError(
              "Storage bucket or folder not found. Please create a bucket named 'files' with an 'uploads' folder.",
            )
          } else {
            setError(`Error fetching files: ${error.message}`)
          }

          setLoading(false)
          return
        }

        if (data) {
          const fileObjects = await Promise.all(
            data.map(async (file) => {
              // Get metadata from Supabase for file type and size
              const { data: urlData } = supabase.storage.from("files").getPublicUrl(`uploads/${file.name}`)

              // Use our custom URL instead of direct Supabase URL
              const fileUrl = getFileUrl(file.name)

              return {
                name: file.name.split("-").pop() || file.name, // Try to get original filename
                id: file.name,
                created_at: file.created_at || new Date().toISOString(),
                size: file.metadata?.size || 0,
                url: fileUrl,
                type: file.metadata?.mimetype,
              }
            }),
          )

          setFiles(fileObjects)
        }
      } catch (error: any) {
        console.error("Error fetching files:", error)
        setError(`Error fetching files: ${error.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentFiles()
  }, [limit])

  const navigateToFileDetails = (fileId: string) => {
    router.push(`/file/${fileId}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2 text-sm">
            <p className="font-semibold">To fix this issue:</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Storage &gt; Buckets</li>
              <li>Create a bucket named "files" if it doesn't exist</li>
              <li>Create a folder named "uploads" inside the bucket</li>
              <li>Click on the "files" bucket, then go to "Policies" tab</li>
              <li>
                Add the following policies:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    For anonymous uploads: INSERT policy with condition <code>true</code>
                  </li>
                  <li>
                    For public access: SELECT policy with condition <code>true</code>
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (files.length === 0) {
    return <div className="text-center py-8 text-gray-500">No files uploaded yet</div>
  }

  return (
    <div className="grid gap-4">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* File info section - clickable */}
              <div
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigateToFileDetails(file.id)}
              >
                <FileIcon className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-3">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(file.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons - separate from clickable area */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + file.url)
                    toast({ description: "Link copied to clipboard" })
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
