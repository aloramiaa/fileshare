"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DownloadCloud,
  Trash2,
  Eye,
  Search,
  FileIcon,
  ImageIcon,
  FileAudio,
  FileVideo,
  FileText,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { formatFileSize, formatDate, getFileUrl } from "@/lib/file-utils"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"

// Trash folder
const TRASH_FOLDER = "trash"

type FileObject = {
  name: string
  id: string
  created_at: string
  size: number
  url: string
  type?: string
  originalName?: string
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [sortColumn, setSortColumn] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)

    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // List files from the 'files' bucket
      const { data, error } = await supabase.storage.from("files").list("uploads", {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" },
      })

      if (error) {
        throw new Error(`Error fetching files: ${error.message}`)
      }

      if (!data) {
        setFiles([])
        return
      }

      // Process file data
      const fileObjects = await Promise.all(
        data.map(async (file) => {
          // Get public URL from Supabase
          const { data: urlData } = supabase.storage.from("files").getPublicUrl(`uploads/${file.name}`)

          // Use our custom URL instead of direct Supabase URL
          const fileUrl = getFileUrl(file.name)

          // Try to extract original filename from the UUID filename
          const originalName = file.name.split("-").pop() || file.name

          return {
            name: file.name,
            id: file.name,
            created_at: file.created_at || new Date().toISOString(),
            size: file.metadata?.size || 0,
            url: fileUrl,
            type: file.metadata?.mimetype,
            originalName,
          }
        }),
      )

      setFiles(fileObjects)
    } catch (error: any) {
      console.error("Error fetching files:", error)
      setError(`${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleDelete = async (fileId: string) => {
    setActionLoading(true)
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Check if trash folder exists, if not create it
      const { data: folderExists, error: folderError } = await supabase.storage.from("files").list(TRASH_FOLDER)

      if (folderError && folderError.message.includes("The resource was not found")) {
        // Create trash folder
        await supabase.storage.from("files").upload(`${TRASH_FOLDER}/.keep`, new Blob([""]))
      }

      // Copy file to trash
      const { error: copyError } = await supabase.storage
        .from("files")
        .copy(`uploads/${fileId}`, `${TRASH_FOLDER}/${fileId}`)

      if (copyError) {
        throw copyError
      }

      // Delete from uploads
      const { error: deleteError } = await supabase.storage.from("files").remove([`uploads/${fileId}`])

      if (deleteError) {
        throw deleteError
      }

      // Remove from state
      setFiles(files.filter((file) => file.id !== fileId))
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId))

      toast({
        title: "File moved to trash",
        description: "The file has been moved to the trash.",
      })
    } catch (error: any) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: `Failed to delete file: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return
    setActionLoading(true)

    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Check if trash folder exists, if not create it
      const { data: folderExists, error: folderError } = await supabase.storage.from("files").list(TRASH_FOLDER)

      if (folderError && folderError.message.includes("The resource was not found")) {
        // Create trash folder
        await supabase.storage.from("files").upload(`${TRASH_FOLDER}/.keep`, new Blob([""]))
      }

      // Move each file to trash
      for (const fileId of selectedFiles) {
        // Copy to trash
        await supabase.storage.from("files").copy(`uploads/${fileId}`, `${TRASH_FOLDER}/${fileId}`)
      }

      // Delete from uploads
      const filePaths = selectedFiles.map((id) => `uploads/${id}`)
      const { error } = await supabase.storage.from("files").remove(filePaths)

      if (error) {
        throw error
      }

      // Remove from state
      setFiles(files.filter((file) => !selectedFiles.includes(file.id)))
      setSelectedFiles([])

      toast({
        title: "Files moved to trash",
        description: `Successfully moved ${selectedFiles.length} files to trash.`,
      })
    } catch (error: any) {
      console.error("Error deleting files:", error)
      toast({
        title: "Error",
        description: `Failed to delete files: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const toggleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map((file) => file.id))
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon className="h-5 w-5 text-gray-400" />

    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />
    if (fileType.startsWith("audio/")) return <FileAudio className="h-5 w-5 text-green-500" />
    if (fileType.startsWith("video/")) return <FileVideo className="h-5 w-5 text-purple-500" />
    if (fileType.startsWith("text/") || fileType.includes("document"))
      return <FileText className="h-5 w-5 text-yellow-500" />

    return <FileIcon className="h-5 w-5 text-gray-400" />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 toxic-text dystopian-glitch" data-text="FILE REPOSITORY">FILE REPOSITORY</h1>

      {error && (
        <Alert variant="destructive" className="mb-6 dystopian-border warning-blink">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="toxic-text">SYSTEM ALERT</AlertTitle>
          <AlertDescription className="font-mono">
            {error}
            <div className="mt-2">
              <p className="font-semibold text-[rgba(var(--toxic-red-rgb),0.9)]">TROUBLESHOOTING PROTOCOL:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-gray-300 font-mono">
                <li>Check Supabase environment variables</li>
                <li>Verify 'files' bucket exists in storage</li>
                <li>Confirm 'uploads' folder exists</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6 dystopian-card">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.7)]" />
              <Input
                placeholder="SEARCH FILES"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 dystopian-input font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="dystopian-button font-mono"
                disabled={loading || actionLoading}
                onClick={fetchFiles}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                SYNC
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="dystopian-button font-mono"
                disabled={selectedFiles.length === 0 || actionLoading}
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {actionLoading ? "PROCESSING..." : "MOVE TO TRASH"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border border-[rgba(var(--toxic-red-rgb),0.3)] dystopian-card">
        <Table>
          <TableHeader className="bg-[rgba(var(--cyber-black-rgb),0.7)]">
            <TableRow className="border-b border-[rgba(var(--toxic-red-rgb),0.3)] hover:bg-[rgba(var(--toxic-red-rgb),0.05)]">
              <TableHead className="w-[50px]">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length > 0 && selectedFiles.length === files.length}
                    onChange={toggleSelectAll}
                    className="rounded-sm"
                  />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer font-mono text-[rgba(var(--toxic-red-rgb),0.9)]"
                onClick={() => handleSort("name")}
              >
                FILE NAME
                {sortColumn === "name" && (
                  <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer font-mono text-[rgba(var(--toxic-red-rgb),0.9)]"
                onClick={() => handleSort("size")}
              >
                SIZE
                {sortColumn === "size" && (
                  <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer font-mono text-[rgba(var(--toxic-red-rgb),0.9)]"
                onClick={() => handleSort("created_at")}
              >
                UPLOAD DATE
                {sortColumn === "created_at" && (
                  <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead className="text-right font-mono text-[rgba(var(--toxic-red-rgb),0.9)]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-[rgba(var(--toxic-red-rgb),0.1)] hover:bg-[rgba(var(--toxic-red-rgb),0.05)]">
                  <TableCell>
                    <div className="h-5 w-5 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                      <div className="h-5 w-48 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-16 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-32 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-8 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : files.length === 0 ? (
              <TableRow className="border-b border-[rgba(var(--toxic-red-rgb),0.1)] hover:bg-[rgba(var(--toxic-red-rgb),0.05)]">
                <TableCell colSpan={5} className="h-24 text-center font-mono text-gray-500">
                  {searchTerm ? "NO FILES MATCHING SEARCH CRITERIA" : "NO FILES FOUND IN STORAGE"}
                </TableCell>
              </TableRow>
            ) : (
              files
                .filter((file) =>
                  file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  file.id.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((file) => (
                  <TableRow key={file.id} className="border-b border-[rgba(var(--toxic-red-rgb),0.1)] hover:bg-[rgba(var(--toxic-red-rgb),0.05)]">
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleSelectFile(file.id)}
                          className="rounded-sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <span className="ml-2 font-mono">
                          {file.originalName}
                          <span className="block text-xs text-gray-500 font-mono data-corruption">{file.id}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{formatFileSize(file.size)}</TableCell>
                    <TableCell className="font-mono">{formatDate(file.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:bg-[rgba(var(--toxic-red-rgb),0.1)]">
                          <a href={file.url} target="_blank" rel="noreferrer">
                            <Eye className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.7)]" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[rgba(var(--toxic-red-rgb),0.1)]"
                          asChild
                        >
                          <a
                            href={file.url}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            <DownloadCloud className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.7)]" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[rgba(var(--toxic-red-rgb),0.1)]"
                          onClick={() => handleDelete(file.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.7)]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
