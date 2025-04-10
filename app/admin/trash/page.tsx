"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Trash2, RefreshCw, RotateCcw, FileIcon, Clock, AlertTriangle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { formatFileSize, formatDate } from "@/lib/file-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// In a real app, you would have a separate "trash" folder or a database flag
// For this demo, we'll simulate trash by moving files to a "trash" folder
const TRASH_FOLDER = "trash"

type TrashFile = {
  id: string
  name: string
  size: number
  type?: string
  deleted_at: string
}

export default function TrashPage() {
  const [loading, setLoading] = useState(false)
  const [trashFiles, setTrashFiles] = useState<TrashFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch trash files
  const fetchTrashFiles = async () => {
    setLoadingFiles(true)
    setError(null)

    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Check if trash folder exists, if not create it
      try {
        const { data: folderExists, error: folderError } = await supabase.storage.from("files").list(TRASH_FOLDER)

        if (folderError && folderError.message.includes("The resource was not found")) {
          // Create trash folder
          await supabase.storage.from("files").upload(`${TRASH_FOLDER}/.keep`, new Blob([""]))
        }
      } catch (error) {
        console.error("Error checking/creating trash folder:", error)
        // Continue anyway
      }

      // Get files from trash folder
      const { data, error } = await supabase.storage.from("files").list(TRASH_FOLDER)

      if (error) {
        throw new Error(`Error fetching trash files: ${error.message}`)
      }

      if (!data) {
        setTrashFiles([])
        return
      }

      // Filter out the .keep file
      const files = data
        .filter((file) => file.name !== ".keep")
        .map((file) => ({
          id: file.name,
          name: file.name.split("-").pop() || file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype,
          deleted_at: file.created_at || new Date().toISOString(),
        }))

      setTrashFiles(files)
    } catch (error: any) {
      console.error("Error fetching trash files:", error)
      setError(`${error.message || "Unknown error"}`)
      toast({
        title: "Error",
        description: "Failed to fetch trash files",
        variant: "destructive",
      })
    } finally {
      setLoadingFiles(false)
    }
  }

  useEffect(() => {
    fetchTrashFiles()
  }, [])

  const emptyTrash = async () => {
    setLoading(true)
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Delete all files in trash
      const filePaths = trashFiles.map((file) => `${TRASH_FOLDER}/${file.id}`)

      if (filePaths.length > 0) {
        const { error } = await supabase.storage.from("files").remove(filePaths)

        if (error) {
          throw error
        }

        setTrashFiles([])
        toast({
          title: "Trash emptied",
          description: "All files in the trash have been permanently deleted.",
        })
      } else {
        toast({
          title: "Trash is empty",
          description: "There are no files to delete.",
        })
      }
    } catch (error: any) {
      console.error("Error emptying trash:", error)
      toast({
        title: "Error",
        description: "Failed to empty trash",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const restoreFile = async (fileId: string) => {
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Copy file from trash to uploads
      const { error: copyError } = await supabase.storage
        .from("files")
        .copy(`${TRASH_FOLDER}/${fileId}`, `uploads/${fileId}`)

      if (copyError) {
        throw copyError
      }

      // Delete file from trash
      const { error: deleteError } = await supabase.storage.from("files").remove([`${TRASH_FOLDER}/${fileId}`])

      if (deleteError) {
        throw deleteError
      }

      // Update UI
      setTrashFiles(trashFiles.filter((file) => file.id !== fileId))

      toast({
        title: "File restored",
        description: "The file has been restored to your uploads.",
      })
    } catch (error: any) {
      console.error("Error restoring file:", error)
      toast({
        title: "Error",
        description: "Failed to restore file",
        variant: "destructive",
      })
    }
  }

  const restoreAll = async () => {
    setLoading(true)
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Restore all files
      for (const file of trashFiles) {
        await supabase.storage.from("files").copy(`${TRASH_FOLDER}/${file.id}`, `uploads/${file.id}`)
      }

      // Delete all from trash
      const filePaths = trashFiles.map((file) => `${TRASH_FOLDER}/${file.id}`)
      await supabase.storage.from("files").remove(filePaths)

      setTrashFiles([])
      toast({
        title: "All files restored",
        description: "All files have been restored to your uploads.",
      })
    } catch (error: any) {
      console.error("Error restoring all files:", error)
      toast({
        title: "Error",
        description: "Failed to restore all files",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold toxic-text dystopian-glitch" data-text="DATA PURGE TERMINAL">DATA PURGE TERMINAL</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchTrashFiles}
            disabled={loadingFiles}
            className="dystopian-button font-mono"
          >
            {loadingFiles ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            SCAN
          </Button>
          <Button
            variant="outline"
            onClick={restoreAll}
            disabled={loading || trashFiles.length === 0}
            className="dystopian-button font-mono"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            RESTORE ALL
          </Button>
          <Button
            variant="destructive"
            onClick={emptyTrash}
            disabled={loading || trashFiles.length === 0}
            className="dystopian-button font-mono"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            PURGE ALL
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 dystopian-border warning-blink">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="toxic-text">SYSTEM ALERT</AlertTitle>
          <AlertDescription className="font-mono">
            {error}
            <div className="mt-2">
              <p className="font-semibold text-[rgba(var(--toxic-red-rgb),0.9)]">DIAGNOSTIC PROTOCOL:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-gray-300 font-mono">
                <li>Verify storage bucket configuration</li>
                <li>Check file system permissions</li>
                <li>Validate trash folder existence</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="dystopian-card">
        <CardHeader className="border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
          <CardTitle className="toxic-text font-mono">MARKED FILES FOR DELETION</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingFiles ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
              ))}
            </div>
          ) : trashFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="p-3 rounded-full bg-[rgba(var(--toxic-red-rgb),0.1)] mb-4">
                <Trash2 className="h-6 w-6 text-[rgba(var(--toxic-red-rgb),0.7)]" />
              </div>
              <h3 className="text-lg font-medium toxic-text mb-1 font-mono">PURGE CONTAINER EMPTY</h3>
              <p className="text-sm text-gray-500 font-mono">NO FILES FOUND IN DELETION BUFFER</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-12 gap-4 bg-[rgba(var(--cyber-black-rgb),0.7)] p-4 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
                <div className="col-span-1 text-[rgba(var(--toxic-red-rgb),0.9)] font-mono text-sm">TYPE</div>
                <div className="col-span-5 text-[rgba(var(--toxic-red-rgb),0.9)] font-mono text-sm">FILE NAME</div>
                <div className="col-span-2 text-[rgba(var(--toxic-red-rgb),0.9)] font-mono text-sm">SIZE</div>
                <div className="col-span-2 text-[rgba(var(--toxic-red-rgb),0.9)] font-mono text-sm">DELETED ON</div>
                <div className="col-span-2 text-right text-[rgba(var(--toxic-red-rgb),0.9)] font-mono text-sm">ACTIONS</div>
              </div>
              <div className="divide-y divide-[rgba(var(--toxic-red-rgb),0.1)]">
                {trashFiles.map((file) => (
                  <div key={file.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[rgba(var(--toxic-red-rgb),0.05)]">
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[rgba(var(--toxic-red-rgb),0.1)]">
                        <FileIcon className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.7)]" />
                      </div>
                    </div>
                    <div className="col-span-5 font-mono">
                      {file.name}
                      <div className="text-xs text-gray-500 font-mono data-corruption">{file.id}</div>
                    </div>
                    <div className="col-span-2 font-mono">{formatFileSize(file.size)}</div>
                    <div className="col-span-2 flex items-center font-mono">
                      <Clock className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-sm">{formatDate(file.deleted_at)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreFile(file.id)}
                        disabled={loading}
                        className="h-8 w-8 p-0 hover:bg-[rgba(var(--acid-green-rgb),0.1)]"
                      >
                        <RotateCcw className="h-4 w-4 text-[rgba(var(--acid-green-rgb),0.7)]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Example of a single file deletion (if implemented)
                          toast({
                            title: "Delete file",
                            description: "This feature would permanently delete a single file.",
                          })
                        }}
                        disabled={loading}
                        className="h-8 w-8 p-0 hover:bg-[rgba(var(--toxic-red-rgb),0.1)]"
                      >
                        <Trash2 className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.7)]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="dystopian-card">
        <CardHeader className="border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
          <CardTitle className="toxic-text font-mono">SYSTEM RETENTION POLICY</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="font-mono dystopian-terminal p-4">
              <div className="text-sm space-y-2">
                <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                  [SYSTEM] Files in trash: {trashFiles.length}
                </div>
                <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                  [SYSTEM] Total space recoverable: {formatFileSize(trashFiles.reduce((acc, file) => acc + file.size, 0))}
                </div>
                <div className="text-[rgba(var(--warning-yellow-rgb),0.9)]">
                  [NOTICE] Auto-purge scheduled: In 7 days
                </div>
                <div className="text-[rgba(var(--toxic-red-rgb),0.9)]">
                  [WARNING] Files permanently deleted after purge
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">DELETION QUEUE STATUS</span>
                  <span className="text-sm font-mono">{trashFiles.length > 0 ? "ACTIVE" : "IDLE"}</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div 
                    className={`h-full ${trashFiles.length > 0 ? "bg-[rgba(var(--warning-yellow-rgb),0.6)]" : "bg-[rgba(var(--acid-green-rgb),0.6)]"}`} 
                    style={{ width: trashFiles.length > 0 ? "100%" : "10%" }} 
                  ></div>
                </div>
              </div>
              
              <div className="p-4 border border-[rgba(var(--toxic-red-rgb),0.3)] rounded">
                <h3 className="font-mono text-sm mb-2 toxic-text">RETENTION PROTOCOL</h3>
                <ul className="space-y-2 text-sm font-mono">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--toxic-red-rgb),0.7)] mt-1.5 mr-2"></div>
                    <span>Files remain in trash for 7 days</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--toxic-red-rgb),0.7)] mt-1.5 mr-2"></div>
                    <span>Files can be restored at any time before purge</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--toxic-red-rgb),0.7)] mt-1.5 mr-2"></div>
                    <span>Automated cleanup runs weekly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
