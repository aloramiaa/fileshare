"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  X,
  FileIcon,
  ImageIcon,
  FileAudio,
  FileVideo,
  FileText,
  AlertTriangle,
  Check,
  LinkIcon,
  Copy,
  ExternalLink,
  Loader2,
  Shield,
  Clock,
  Zap,
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getFileUrl, formatFileSize } from "@/lib/file-utils"
import { useSettings } from "@/contexts/settings-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: number; id: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [currentFileName, setCurrentFileName] = useState("")
  const [passwordProtect, setPasswordProtect] = useState(false)
  const [password, setPassword] = useState("")
  const [expiryEnabled, setExpiryEnabled] = useState(false)
  const [expiryDays, setExpiryDays] = useState(7)
  const [uploadSpeed, setUploadSpeed] = useState(0) // KB/s
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [totalBytesUploaded, setTotalBytesUploaded] = useState(0)
  const [uploadStartTime, setUploadStartTime] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)
  const [lastBytesUploaded, setLastBytesUploaded] = useState(0)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Get settings from context
  const { settings, loading: settingsLoading } = useSettings()
  const { maxFileSize, allowedFileTypes } = settings.storage

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check file types if specific types are allowed
      if (allowedFileTypes !== "*") {
        const allowedExtensions = allowedFileTypes.split(",").map((ext) => ext.trim().toLowerCase())

        const filteredFiles = acceptedFiles.filter((file) => {
          const extension = file.name.split(".").pop()?.toLowerCase() || ""
          return allowedExtensions.includes(extension)
        })

        if (filteredFiles.length !== acceptedFiles.length) {
          toast({
            title: "INVALID FILE TYPE",
            description: `ONLY ${allowedFileTypes.toUpperCase()} FILES ARE ALLOWED.`,
            variant: "destructive",
          })

          // Only add the valid files
          setFiles((prevFiles) => [...prevFiles, ...filteredFiles])
          return
        }
      }

      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
      setError(null)
    },
    [allowedFileTypes],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
    onDropAccepted: () => setIsDraggingOver(false),
    onDropRejected: () => setIsDraggingOver(false),
  })

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  // Enhanced upload with speed and time calculation
  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    setCurrentFileIndex(0)
    setTotalBytesUploaded(0)
    setUploadSpeed(0)
    setTimeRemaining("")
    setError(null)
    setUploadStartTime(Date.now())
    setLastUpdateTime(Date.now())
    setLastBytesUploaded(0)

    // Initialize Supabase client inside the function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("MISSING SUPABASE ENVIRONMENT VARIABLES")
      setUploading(false)
      return
    }

    console.log("Supabase URL:", supabaseUrl)
    console.log("Supabase Key Length:", supabaseAnonKey?.length)

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const totalFiles = files.length
    let completedFiles = 0
    const newUploadedFiles: { name: string; url: string; size: number; id: string }[] = []
    let hasError = false

    // Calculate total size for all files
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0)
    let totalBytesProcessed = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentFileIndex(i)
      setCurrentFileName(file.name)
      setProgress(0)

      try {
        // Create a unique file name
        const fileExt = file.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `uploads/${fileName}`

        // Start progress simulation immediately
        let simulatedProgress = 0
        const progressInterval = setInterval(() => {
          if (simulatedProgress < 95) {
            // Increment simulated progress more realistically
            const increment = Math.max(1, Math.min(5, Math.floor(Math.random() * 10)))
            simulatedProgress = Math.min(95, simulatedProgress + increment)
            setProgress(simulatedProgress)
            
            // Update bytes uploaded based on simulated progress
            const simulatedBytes = Math.floor((file.size * simulatedProgress) / 100)
            const newTotalBytes = totalBytesProcessed - (i > 0 ? file.size : 0) + simulatedBytes
            setTotalBytesUploaded(newTotalBytes)
            
            // Calculate upload speed
            const now = Date.now()
            const timeDiff = now - lastUpdateTime
            
            if (timeDiff > 200) {
              const bytesChange = newTotalBytes - lastBytesUploaded
              const speedKBps = Math.round(((bytesChange / timeDiff) * 1000) / 1024)
              setUploadSpeed(speedKBps)
              
              // Calculate time remaining
              const bytesRemaining = totalBytes - newTotalBytes
              if (speedKBps > 0) {
                const msRemaining = (bytesRemaining / (speedKBps * 1024)) * 1000
                
                // Format time remaining
                if (msRemaining < 1000) {
                  setTimeRemaining("< 1 SEC")
                } else if (msRemaining < 60000) {
                  setTimeRemaining(`${Math.ceil(msRemaining / 1000)} SEC`)
                } else {
                  const minutes = Math.floor(msRemaining / 60000)
                  const seconds = Math.ceil((msRemaining % 60000) / 1000)
                  setTimeRemaining(`${minutes}M ${seconds}S`)
                }
              }
              
              setLastUpdateTime(now)
              setLastBytesUploaded(newTotalBytes)
            }
            
            // Animate progress bar
            if (progressBarRef.current) {
              const intensity = 0.2 + (simulatedProgress / 100) * 0.8
              progressBarRef.current.style.boxShadow = `0 0 ${10 + simulatedProgress / 5}px rgba(var(--toxic-red-rgb), ${intensity})`
            }
          }
        }, 100)
        
        // Actually upload the file to Supabase
        const { data, error } = await supabase.storage
          .from("files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })
          
        // Clear the simulation interval
        clearInterval(progressInterval)
        
        // Set to 100% when upload is actually complete
        setProgress(100)
        totalBytesProcessed += file.size
        setTotalBytesUploaded(totalBytesProcessed)

        if (error) {
          console.error("Upload error:", error)
          hasError = true

          if (error.message.includes("row-level security policy")) {
            setError("STORAGE PERMISSION DENIED. CONFIGURE SUPABASE STORAGE BUCKET PERMISSIONS.")
            break
          } else {
            throw error
          }
        }

        // Use our custom URL instead of the direct Supabase URL
        const fileUrl = getFileUrl(fileName)

        // Store metadata if password protection or expiry is enabled
        if (passwordProtect || expiryEnabled) {
          try {
            console.log("Storing metadata for file:", fileName);
            
            // Store file metadata in Supabase through our API
            const metadataResponse = await fetch('/api/files/metadata', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: fileName,
                passwordProtected: passwordProtect,
                password: passwordProtect ? password : null,
                expiryEnabled: expiryEnabled,
                expiryDate: expiryEnabled ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : null,
              }),
            });

            const metadataResult = await metadataResponse.json();
            
            if (!metadataResult.success) {
              console.error("Error storing file metadata:", metadataResult);
              
              let errorMsg = metadataResult.message;
              // Add details if available
              if (metadataResult.details) {
                console.error("Error details:", metadataResult.details);
                if (metadataResult.details.hint) {
                  errorMsg += ` - ${metadataResult.details.hint}`;
                }
              }
              
              toast({
                title: "WARNING",
                description: `FILE UPLOADED BUT SECURITY SETTINGS MAY NOT BE APPLIED: ${errorMsg}`,
                variant: "destructive",
              });
            } else {
              console.log("Metadata stored successfully");
            }
          } catch (metadataError) {
            console.error("Error storing file metadata:", metadataError);
            toast({
              title: "WARNING",
              description: "FILE UPLOADED BUT SECURITY SETTINGS MAY NOT BE APPLIED - CONNECTION ERROR",
              variant: "destructive",
            });
          }
        }

        newUploadedFiles.push({
          name: file.name,
          url: fileUrl,
          size: file.size,
          id: fileName,
        })

        completedFiles++
      } catch (error: any) {
        console.error("Error uploading file:", error)
        hasError = true

        toast({
          title: "UPLOAD FAILED",
          description: `FAILED TO UPLOAD ${file.name.toUpperCase()}: ${error.message || "UNKNOWN ERROR"}`,
          variant: "destructive",
        })
      }
    }

    if (newUploadedFiles.length > 0) {
      setUploadedFiles(newUploadedFiles)

      toast({
        title: "UPLOAD COMPLETE",
        description: `SUCCESSFULLY UPLOADED ${newUploadedFiles.length} FILES`,
      })

      // Refresh the files list
      router.refresh()
    }

    setFiles(hasError ? files : [])
    setUploading(false)
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-[hsl(var(--toxic-red))]" />
    if (type.startsWith("audio/")) return <FileAudio className="h-8 w-8 text-[hsl(var(--acid-green))]" />
    if (type.startsWith("video/")) return <FileVideo className="h-8 w-8 text-[hsl(var(--digital-blue))]" />
    if (type.startsWith("text/") || type.includes("document"))
      return <FileText className="h-8 w-8 text-[hsl(var(--warning-yellow))]" />
    return <FileIcon className="h-8 w-8 text-[hsl(var(--toxic-red))]" />
  }

  // Add glitch effect when files are uploaded successfully
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      // Create glitch effect
      const glitchEffect = () => {
        const container = document.createElement("div")
        container.style.position = "fixed"
        container.style.top = "0"
        container.style.left = "0"
        container.style.width = "100vw"
        container.style.height = "100vh"
        container.style.backgroundColor = "rgba(255, 0, 60, 0.05)"
        container.style.zIndex = "9999"
        container.style.pointerEvents = "none"
        document.body.appendChild(container)

        // Create glitch animation
        const animate = () => {
          container.style.opacity = Math.random() > 0.8 ? "0.1" : "0"
          container.style.transform = `translateX(${Math.random() * 10 - 5}px)`

          if (Math.random() > 0.95) {
            container.style.backgroundColor = "rgba(0, 255, 60, 0.05)"
          } else {
            container.style.backgroundColor = "rgba(255, 0, 60, 0.05)"
          }

          setTimeout(() => {
            requestAnimationFrame(animate)
          }, Math.random() * 100)
        }

        animate()

        // Remove after 2 seconds
        setTimeout(() => {
          document.body.removeChild(container)
        }, 2000)
      }

      glitchEffect()
    }
  }, [uploadedFiles])

  return (
    <div className="space-y-8 digital-noise">
      {error && (
        <Alert variant="destructive" className="animate-scale-in dystopian-border bg-[rgba(var(--toxic-red-rgb),0.1)]">
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--toxic-red))]" />
          <AlertTitle className="toxic-text">SYSTEM ERROR</AlertTitle>
          <AlertDescription className="text-gray-300 font-mono">
            {error}
            <div className="mt-2 text-sm">
              <p className="font-semibold text-[hsl(var(--toxic-red))]">TROUBLESHOOTING PROTOCOL:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-gray-400">
                <li>ACCESS SUPABASE DASHBOARD</li>
                <li>NAVIGATE TO STORAGE &gt; BUCKETS</li>
                <li>CREATE BUCKET "files" IF NOT FOUND</li>
                <li>ACCESS "files" BUCKET, NAVIGATE TO "POLICIES" TAB</li>
                <li>
                  ADD FOLLOWING POLICIES:
                  <ul className="list-disc pl-5 mt-1">
                    <li>
                      ANONYMOUS UPLOADS: INSERT POLICY WITH CONDITION{" "}
                      <code className="bg-[rgba(var(--toxic-red-rgb),0.2)] px-1 rounded">true</code>
                    </li>
                    <li>
                      PUBLIC ACCESS: SELECT POLICY WITH CONDITION{" "}
                      <code className="bg-[rgba(var(--toxic-red-rgb),0.2)] px-1 rounded">true</code>
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 ${
          isDraggingOver
            ? "border-[hsl(var(--toxic-red))] bg-[rgba(var(--toxic-red-rgb),0.1)] scale-105 dystopian-border"
            : isDragActive
              ? "border-[hsl(var(--toxic-red))] bg-[rgba(var(--toxic-red-rgb),0.05)]"
              : "border-gray-700 hover:border-[hsl(var(--toxic-red))] hover:bg-[rgba(var(--toxic-red-rgb),0.05)]"
        } dystopian-bg scan-lines`}
      >
        <input {...getInputProps()} />
        <div className={`transition-transform duration-300 ${isDraggingOver ? "scale-110" : ""}`}>
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[rgba(var(--toxic-red-rgb),0.1)] flex items-center justify-center dystopian-border warning-flash">
            <Upload className="h-12 w-12 text-[hsl(var(--toxic-red))]" />
          </div>
          <p
            className="text-xl font-medium toxic-text dystopian-glitch"
            data-text={
              isDraggingOver ? "DROP FILES HERE" : isDragActive ? "DROP THE FILES HERE" : "DRAG & DROP FILES HERE"
            }
          >
            {isDraggingOver ? "DROP FILES HERE" : isDragActive ? "DROP THE FILES HERE" : "DRAG & DROP FILES HERE"}
          </p>
          <p className="mt-2 text-sm text-gray-400 font-mono">OR CLICK TO BROWSE FILES</p>
          <p className="mt-4 text-xs text-gray-500 font-mono">MAX FILE SIZE: {maxFileSize}MB</p>
          {allowedFileTypes !== "*" && (
            <p className="mt-1 text-xs text-gray-500 font-mono">ALLOWED FILE TYPES: {allowedFileTypes}</p>
          )}
        </div>
      </div>

      {/* Security Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="dystopian-card p-4 rounded-lg warning-stripes">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[hsl(var(--toxic-red))]" />
              <Label htmlFor="password-protect" className="toxic-text text-sm">
                PASSWORD PROTECTION
              </Label>
            </div>
            <Switch
              id="password-protect"
              checked={passwordProtect}
              onCheckedChange={setPasswordProtect}
              className="data-[state=checked]:bg-[hsl(var(--toxic-red))]"
            />
          </div>

          {passwordProtect && (
            <div className="mt-4">
              <Input
                type="password"
                placeholder="SET PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dystopian-input"
              />
              <p className="mt-1 text-xs text-gray-500 font-mono">RECIPIENTS WILL NEED THIS PASSWORD TO ACCESS FILES</p>
            </div>
          )}
        </div>

        <div className="dystopian-card p-4 rounded-lg warning-stripes">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[hsl(var(--acid-green))]" />
              <Label htmlFor="expiry-enabled" className="acid-text text-sm">
                FILE EXPIRATION
              </Label>
            </div>
            <Switch
              id="expiry-enabled"
              checked={expiryEnabled}
              onCheckedChange={setExpiryEnabled}
              className="data-[state=checked]:bg-[hsl(var(--acid-green))]"
            />
          </div>

          {expiryEnabled && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number.parseInt(e.target.value))}
                  className="dystopian-input"
                />
                <span className="text-gray-400 font-mono">DAYS</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 font-mono">
                FILES WILL BE AUTOMATICALLY DELETED AFTER THIS PERIOD
              </p>
            </div>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium toxic-text">SELECTED FILES ({files.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-[hsl(var(--toxic-red))]">
              CLEAR ALL
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 dystopian-card rounded-lg transition-all duration-300 hover:border-[rgba(var(--toxic-red-rgb),0.8)] digital-distortion"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-[rgba(var(--cyber-black-rgb),0.6)] p-3 rounded-lg dystopian-border">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate toxic-text">{file.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-[hsl(var(--toxic-red))] transition-colors p-2 rounded-full hover:bg-[rgba(var(--toxic-red-rgb),0.1)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Dystopian Upload Button */}
          <Button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full h-14 text-lg font-bold relative overflow-hidden group dystopian-button"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-mono">
                  UPLOADING {currentFileIndex + 1}/{files.length}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Upload className="h-5 w-5 group-hover:animate-bounce" />
                <span className="font-mono">UPLOAD FILES</span>
              </div>
            )}
          </Button>

          {/* Dystopian Progress Bar */}
          {uploading && (
            <div className="space-y-3 animate-fade-in">
              <div ref={progressContainerRef} className="dystopian-progress relative overflow-hidden group">
                <div ref={progressBarRef} className="dystopian-progress-bar" style={{ width: `${progress}%` }}>
                  {/* Data stream effect */}
                  <div className="absolute inset-0 opacity-50">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 w-1 bg-white absolute rounded-full warning-flash"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Scanline effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="w-full h-[1px] bg-[rgba(var(--toxic-red-rgb),0.7)] absolute top-0 left-0 animate-surveillance-scan"></div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-mono">
                    UPLOADING:{" "}
                    <span className="toxic-text truncate max-w-[150px] inline-block align-bottom">
                      {currentFileName}
                    </span>
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="acid-text flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      {uploadSpeed} KB/s
                    </span>
                    {timeRemaining && (
                      <span className="toxic-text flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeRemaining} LEFT
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="toxic-text text-lg font-mono">{progress}%</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatFileSize(totalBytesUploaded)} /{" "}
                    {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-12 space-y-6 animate-slide-up">
          <h3 className="text-xl font-medium flex items-center toxic-text">
            <Check className="mr-2 h-5 w-5 text-[hsl(var(--acid-green))]" />
            UPLOAD COMPLETE
          </h3>
          <div className="grid gap-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="dystopian-card border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[rgba(var(--cyber-black-rgb),0.6)] p-3 rounded-lg dystopian-border">
                        <FileIcon className="h-8 w-8 text-[hsl(var(--acid-green))]" />
                      </div>
                      <div>
                        <p className="font-medium truncate acid-text">{file.name}</p>
                        <p className="text-sm text-gray-500 font-mono">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="dystopian-button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + file.url)
                          toast({
                            description: "LINK COPIED TO CLIPBOARD",
                            title: "SUCCESS",
                          })
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        COPY LINK
                      </Button>
                      <Button variant="outline" size="sm" className="acid-button" asChild>
                        <a href={`/file/${file.id}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          VIEW
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* File Link Display */}
                  <div className="p-4 border-t border-[rgba(var(--toxic-red-rgb),0.3)] bg-[rgba(var(--cyber-black-rgb),0.4)] dystopian-terminal">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-[hsl(var(--acid-green))]" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm truncate text-gray-400 font-mono">
                          {window.location.origin}
                          {file.url}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[hsl(var(--acid-green))]"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + file.url)
                          toast({
                            description: "LINK COPIED TO CLIPBOARD",
                            title: "SUCCESS",
                          })
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
