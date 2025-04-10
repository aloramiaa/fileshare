"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  ArrowLeft,
  Download,
  Copy,
  Calendar,
  FileIcon,
  Lock,
  EyeOff,
  Share2,
  Info,
  Shield,
  Skull,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import { getFileUrl, formatFileSize, formatDate } from "@/lib/file-utils"
import { useSettings } from "@/contexts/settings-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export default function FilePageClient({ fileId }: { fileId: string }) {
  const [file, setFile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [needsOnlyPassword, setNeedsOnlyPassword] = useState(false)
  const fileIdRef = useRef<string>(fileId)

  const { settings } = useSettings()
  const { requirePassword, enableEncryption } = settings.security

  useEffect(() => {
    async function fetchFile() {
      try {
        // Get the file ID from the ref
        const fileId = fileIdRef.current

        if (!fileId) {
          toast({
            title: "ERROR",
            description: "INVALID FILE ID",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        // Get file metadata from Supabase
        const { data: urlData } = supabase.storage.from("files").getPublicUrl(`uploads/${fileId}`)

        // Get file metadata
        const response = await fetch(urlData.publicUrl, { method: "HEAD" })
        const contentType = response.headers.get("content-type") || ""
        const contentLength = response.headers.get("content-length") || "0"

        // Use our custom URL instead of direct Supabase URL
        const fileUrl = getFileUrl(fileId)

        setFile({
          id: fileId,
          name: fileId.split("-").pop() || fileId,
          url: fileUrl,
          type: contentType,
          size: Number.parseInt(contentLength, 10),
          created_at: new Date().toISOString(), // This would ideally come from your database
        })

        // Check if file has password protection by fetching metadata
        try {
          const metadataResponse = await fetch(`/api/files/metadata?id=${fileId}`)
          const metadataResult = await metadataResponse.json()
          
          if (metadataResult.success && metadataResult.data) {
            const { password_protected, encryption_enabled } = metadataResult.data
            
            // If only password protected without encryption, show password screen
            if (password_protected && !encryption_enabled) {
              setShowPasswordInput(true)
              setIsAuthenticated(false)
              setNeedsOnlyPassword(true)
            } else {
              // Either no protection or has encryption - provide direct download
              setIsAuthenticated(true)
              setNeedsOnlyPassword(false)
            }
            
            return // Skip the settings-based checks below
          }
        } catch (metadataError) {
          console.error("Error fetching file metadata:", metadataError)
          // Fall back to settings-based protection
        }

        // If no metadata found, fall back to settings
        if (requirePassword && !enableEncryption) {
          // Only password is required, no encryption
          setShowPasswordInput(true)
          setIsAuthenticated(false)
          setNeedsOnlyPassword(true)
        } else {
          // Either no protection or requires encryption - provide direct download
          setIsAuthenticated(true)
          setNeedsOnlyPassword(false)
        }
      } catch (error) {
        console.error("Error fetching file:", error)
        toast({
          title: "ERROR",
          description: "FAILED TO LOAD FILE DETAILS",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
  }, [requirePassword, enableEncryption])

  const verifyPassword = async () => {
    // Don't proceed if password is empty
    if (!password.trim()) {
      toast({
        title: "ERROR",
        description: "PLEASE ENTER A PASSWORD",
        variant: "destructive",
      })
      return
    }
    
    try {
      const fileId = fileIdRef.current;
      // Verify password with our API
      const verifyResponse = await fetch('/api/files/metadata', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: fileId,
          password: password,
        }),
      })
      
      const verifyResult = await verifyResponse.json()
      
      if (verifyResult.success && verifyResult.authenticated) {
        // Set the authentication cookie for this file
        document.cookie = `file_auth_${fileId}=${password}; path=/; max-age=3600; SameSite=Strict`;
        
        setIsAuthenticated(true)
        setShowPasswordInput(false)
      } else {
        toast({
          title: "ACCESS DENIED",
          description: "INCORRECT PASSWORD",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying password:", error)
      toast({
        title: "SYSTEM ERROR",
        description: "PASSWORD VERIFICATION FAILED",
        variant: "destructive",
      })
    }
  }

  const isImage = file?.type?.startsWith("image/")
  const isVideo = file?.type?.startsWith("video/")
  const isAudio = file?.type?.startsWith("audio/")
  const isPdf = file?.type === "application/pdf"

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4 bg-gray-800" />
            <Skeleton className="h-10 w-2/3 bg-gray-800" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="dystopian-card">
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full bg-gray-800" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="dystopian-card">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32 bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-2/3 bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 bg-gray-800" />
                  <div className="pt-4 space-y-2">
                    <Skeleton className="h-10 w-full bg-gray-800" />
                    <Skeleton className="h-10 w-full bg-gray-800" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-12 dystopian-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 toxic-text font-mono">FILE NOT FOUND</h1>
          <p className="mb-6 text-gray-400 font-mono">THE FILE YOU'RE LOOKING FOR DOESN'T EXIST OR HAS BEEN REMOVED.</p>
          <Button asChild className="dystopian-button">
            <Link href="/">GO BACK HOME</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show password input if it's only password protected
  if (needsOnlyPassword && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 dystopian-bg min-h-screen scan-lines">
        <div className="max-w-md mx-auto animate-fade-in">
          <Card className="dystopian-card overflow-hidden">
            <div className="bg-[rgba(var(--toxic-red-rgb),0.2)] p-6 text-center border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center dystopian-border warning-flash">
                <Lock className="h-8 w-8 text-[hsl(var(--toxic-red))]" />
              </div>
              <h1 className="text-2xl font-bold toxic-text font-mono">PROTECTED FILE</h1>
              <p className="text-gray-400 font-mono">THIS FILE IS PASSWORD PROTECTED</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="toxic-text font-mono">
                  ENTER PASSWORD
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ENTER FILE PASSWORD"
                    className="dystopian-input pl-10 font-mono"
                    onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
                  />
                </div>
              </div>
              <Button className="w-full dystopian-button" onClick={verifyPassword}>
                ACCESS FILE
              </Button>
              <div className="text-center">
                <Link
                  href="/files"
                  className="text-sm text-[hsl(var(--toxic-red))] hover:underline flex items-center justify-center font-mono"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  BACK TO FILES
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If we reach here, either:
  // 1. The file doesn't need password
  // 2. The file needs password + encryption (direct download)
  // 3. The user has already entered the password for a password-only file
  return (
    <div className="container mx-auto px-4 py-8 dystopian-bg scan-lines">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <Button variant="ghost" size="sm" asChild className="mb-4 text-[hsl(var(--toxic-red))]">
            <Link href="/files">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="font-mono">BACK TO FILES</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold break-words toxic-text font-mono dystopian-glitch" data-text={file.name}>
            {file.name}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 animate-scale-in">
            <Card className="dystopian-card overflow-hidden">
              <CardContent className="p-0">
                {isImage && (
                  <div className="relative aspect-video bg-[rgba(var(--cyber-black-rgb),0.8)] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 scan-lines pointer-events-none"></div>
                    <Image
                      src={`${file.url}${isAuthenticated ? `?token=${password}` : ''}`}
                      alt={file.name}
                      fill
                      className="object-contain transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
                {isVideo && (
                  <div className="aspect-video bg-[rgba(var(--cyber-black-rgb),0.8)]">
                    <div className="absolute inset-0 scan-lines pointer-events-none"></div>
                    <video src={`${file.url}${isAuthenticated ? `?token=${password}` : ''}`} controls className="w-full h-full" />
                  </div>
                )}
                {isAudio && (
                  <div className="p-8 bg-[rgba(var(--cyber-black-rgb),0.8)] flex items-center justify-center">
                    <div className="absolute inset-0 scan-lines pointer-events-none"></div>
                    <audio src={`${file.url}${isAuthenticated ? `?token=${password}` : ''}`} controls className="w-full" />
                  </div>
                )}
                {isPdf && (
                  <div className="aspect-video bg-[rgba(var(--cyber-black-rgb),0.8)] flex items-center justify-center p-4">
                    <div className="absolute inset-0 scan-lines pointer-events-none"></div>
                    <iframe src={`${file.url}${isAuthenticated ? `#view=FitH&token=${password}` : ''}`} className="w-full h-full border-0" />
                  </div>
                )}
                {!isImage && !isVideo && !isAudio && !isPdf && (
                  <div className="aspect-video bg-[rgba(var(--cyber-black-rgb),0.8)] flex flex-col items-center justify-center p-8">
                    <div className="absolute inset-0 scan-lines pointer-events-none"></div>
                    <div className="w-24 h-24 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center dystopian-border warning-flash">
                      <Skull className="h-12 w-12 text-[hsl(var(--toxic-red))]" />
                    </div>
                    <p className="text-center text-gray-400 mt-4 toxic-text font-mono">
                      PREVIEW NOT AVAILABLE FOR THIS FILE TYPE
                    </p>
                    <div className="mt-6">
                      <Button className="acid-button" asChild>
                        <a href={`${file.url}${isAuthenticated ? `?token=${password}` : ''}`} download={file.name}>
                          <Download className="mr-2 h-4 w-4" />
                          <span className="font-mono">DIRECT DOWNLOAD</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Direct Download Button - Prominent and centered */}
            <div className="mt-4 text-center">
              <Button className="acid-button px-6 py-3 text-lg" asChild>
                <a href={`${file.url}${isAuthenticated ? `?token=${password}` : ''}`} download={file.name}>
                  <Download className="mr-2 h-5 w-5" />
                  <span className="font-mono">DIRECT DOWNLOAD</span>
                </a>
              </Button>
            </div>
          </div>

          <div className="animate-slide-up">
            <Card className="dystopian-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 toxic-text font-mono">FILE INFORMATION</h2>
                <div className="space-y-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center mr-3 dystopian-border">
                      <Info className="h-4 w-4 text-[hsl(var(--toxic-red))]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-mono">FILE TYPE</p>
                      <p className="font-medium toxic-text font-mono">{file.type || "UNKNOWN"}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center mr-3 dystopian-border">
                      <FileIcon className="h-4 w-4 text-[hsl(var(--toxic-red))]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-mono">SIZE</p>
                      <p className="font-medium toxic-text font-mono">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center mr-3 dystopian-border">
                      <Calendar className="h-4 w-4 text-[hsl(var(--toxic-red))]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-mono">UPLOADED</p>
                      <p className="font-medium toxic-text font-mono">{formatDate(file.created_at)}</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      className="w-full dystopian-button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + file.url)
                        toast({
                          description: "LINK COPIED TO CLIPBOARD",
                          title: "SUCCESS",
                        })
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      <span className="font-mono">COPY LINK</span>
                      <Share2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>

                    <Button className="w-full acid-button" asChild>
                      <a href={`${file.url}${isAuthenticated ? `?token=${password}` : ''}`} download={file.name}>
                        <Download className="mr-2 h-4 w-4" />
                        <span className="font-mono">DOWNLOAD</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Card */}
            <Card className="dystopian-card mt-4 warning-stripes">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning-yellow))]" />
                  <h3 className="text-sm font-bold ml-2 warning-text font-mono">WARNING</h3>
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  FILE ACCESS LOGGED. DOWNLOADING THIS FILE INDICATES YOUR ACCEPTANCE OF TERMS. ALL ACTIVITIES ARE
                  MONITORED.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 