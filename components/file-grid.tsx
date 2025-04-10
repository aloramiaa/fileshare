"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileIcon, Lock, Clock, Upload, Trash, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatFileSize, formatDate } from "@/lib/file-utils"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface FileGridProps {
  showMeta?: boolean
  showUploadButton?: boolean
}

export function FileGrid({ showMeta = false, showUploadButton = false }: FileGridProps) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userIp, setUserIp] = useState<string | null>(null)
  const [systemNote, setSystemNote] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/files")
        const data = await response.json()

        if (data.success) {
          setFiles(data.data || [])
          setUserIp(data.ip || null)
          setSystemNote(data.note || null)
        } else {
          setError(data.message || "Failed to fetch files")
          toast({
            title: "ERROR",
            description: data.message || "Failed to fetch files",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching files:", error)
        setError("Network error. Please try again.")
        toast({
          title: "ERROR",
          description: "Network error. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️"
    if (type.startsWith("video/")) return "🎬"
    if (type.startsWith("audio/")) return "🔊"
    if (type === "application/pdf") return "📄"
    if (type.includes("document") || type.includes("word")) return "📝"
    if (type.includes("spreadsheet") || type.includes("excel")) return "📊"
    if (type.includes("presentation") || type.includes("powerpoint")) return "📽️"
    if (type.includes("compressed") || type.includes("zip") || type.includes("rar")) return "🗜️"
    return "📁"
  }

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="dystopian-card overflow-hidden h-[180px]">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="p-4 flex-1 flex flex-col">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 mb-4 bg-gray-800" />
                  <div className="mt-auto">
                    <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                    <Skeleton className="h-4 w-2/3 bg-gray-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-[hsl(var(--toxic-red))] mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 toxic-text">ERROR LOADING FILES</h3>
        <p className="text-gray-400 font-mono mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="dystopian-button"
        >
          RETRY
        </Button>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center mx-auto mb-4 dystopian-border">
          <FileIcon className="h-8 w-8 text-[hsl(var(--toxic-red))]" />
        </div>
        <h3 className="text-xl font-bold mb-2 toxic-text font-mono">NO FILES FOUND</h3>
        <p className="text-gray-400 font-mono mb-6 max-w-md mx-auto">
          YOU HAVE NO FILES UPLOADED FROM YOUR CURRENT IP ADDRESS{userIp ? ` (${userIp})` : ""}.
          {systemNote && <span className="block mt-2 text-xs">{systemNote}</span>}
        </p>
        
        <div className="flex flex-col items-center gap-4">
          {showUploadButton && (
            <Button asChild className="dystopian-button">
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                UPLOAD FILE
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {showUploadButton && (
        <div className="flex justify-end mb-6">
          <Button asChild className="dystopian-button">
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              UPLOAD NEW FILE
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <Link href={`/file/${file.file_id}`} key={file.file_id}>
            <Card className="dystopian-card overflow-hidden h-[180px] transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(var(--toxic-red-rgb),0.3)]">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-2xl mb-1 toxic-text">{getFileTypeIcon(file.type)}</div>
                      <h3 className="font-medium truncate pr-4 acid-text">
                        {file.original_name || file.file_id}
                      </h3>
                    </div>
                    {file.password_protected && (
                      <div className="w-6 h-6 flex items-center justify-center text-[hsl(var(--toxic-red))]">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {showMeta && (
                    <div className="mt-auto pt-2 text-xs text-gray-400 font-mono">
                      <div className="flex justify-between items-center">
                        <span>{formatFileSize(file.size)}</span>
                        {file.encryption_enabled && <span className="text-[hsl(var(--acid-green))]">ENCRYPTED</span>}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-[rgba(var(--cyber-black-rgb),0.6)] text-center p-2 font-mono text-xs dystopian-border-top">
                  VIEW FILE
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 