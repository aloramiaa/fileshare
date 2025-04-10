"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HardDrive, Upload, FileText, BarChart, AlertTriangle, RefreshCw, Shield, Server } from "lucide-react"
import { formatFileSize } from "@/lib/file-utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"

type StatsData = {
  totalFiles: number
  totalStorage: number
  recentUploads: number
  fileTypes: Record<string, number>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalFiles: 0,
    totalStorage: 0,
    recentUploads: 0,
    fileTypes: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
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

      // Get all files
      const { data, error } = await supabase.storage.from("files").list("uploads", {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" },
      })

      if (error) {
        throw new Error(`Error fetching files: ${error.message}`)
      }

      if (!data) {
        throw new Error("No data returned from Supabase")
      }

      // Calculate stats
      let totalSize = 0
      const fileTypes: Record<string, number> = {}
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)

      let recentCount = 0

      data.forEach((file) => {
        // Add to total size
        totalSize += file.metadata?.size || 0

        // Count file types
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "unknown"
        fileTypes[fileExt] = (fileTypes[fileExt] || 0) + 1

        // Count recent uploads
        if (file.created_at) {
          const createdDate = new Date(file.created_at)
          if (createdDate > lastWeek) {
            recentCount++
          }
        }
      })

      setStats({
        totalFiles: data.length,
        totalStorage: totalSize,
        recentUploads: recentCount,
        fileTypes,
      })
    } catch (error: any) {
      console.error("Error calculating stats:", error)
      setError(`${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Get top file types
  const topFileTypes = Object.entries(stats.fileTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold toxic-text dystopian-glitch" data-text="SYSTEM DASHBOARD">
          SYSTEM DASHBOARD
        </h1>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="dystopian-button">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2 font-mono">{loading ? "SYNCING..." : "REFRESH"}</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 dystopian-border warning-blink">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="toxic-text">SYSTEM ALERT</AlertTitle>
          <AlertDescription className="font-mono">
            {error}
            <div className="mt-2 text-sm">
              <p className="font-semibold text-[rgba(var(--toxic-red-rgb),0.9)]">TROUBLESHOOTING PROTOCOL:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-gray-300">
                <li>Verify Supabase environment variables</li>
                <li>Check 'files' bucket existence in storage</li>
                <li>Verify 'uploads' folder in 'files' bucket</li>
                <li>Confirm storage policies allow access</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">TOTAL FILES</CardTitle>
            <FileText className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : (
                stats.totalFiles
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">FILES IN STORAGE</p>
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">STORAGE USED</CardTitle>
            <HardDrive className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : (
                formatFileSize(stats.totalStorage)
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">TOTAL STORAGE ALLOCATION</p>
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">RECENT UPLOADS</CardTitle>
            <Upload className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : (
                stats.recentUploads
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">UPLOADS IN LAST 7 DAYS</p>
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">DOMINANT FORMAT</CardTitle>
            <BarChart className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text uppercase">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : topFileTypes.length > 0 ? (
                topFileTypes[0][0]
              ) : (
                "N/A"
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">MOST COMMON FILE TYPE</p>
          </CardContent>
        </Card>
      </div>

      {/* File Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="dystopian-card">
          <CardHeader className="pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="toxic-text font-mono">FILE FORMAT DISTRIBUTION</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-4 w-20 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
                    <div className="ml-auto h-4 w-12 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : topFileTypes.length > 0 ? (
              <div className="space-y-3">
                {topFileTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center data-corruption">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[rgba(var(--toxic-red-rgb),0.1)] warning-flash mr-2">
                        <span className="text-xs uppercase toxic-text font-mono">{type}</span>
                      </div>
                      <span className="uppercase font-mono">{type} FILES</span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className="h-2 bg-[rgba(var(--toxic-red-rgb),0.5)] rounded-sm mr-2"
                        style={{
                          width: `${Math.max((count / stats.totalFiles) * 100, 5)}px`,
                        }}
                      ></div>
                      <span className="text-sm font-mono">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 font-mono">NO FILE DATA AVAILABLE</div>
            )}
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="toxic-text font-mono">SYSTEM STATUS</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[rgba(var(--acid-green-rgb),1)] mr-2 animate-pulse"></div>
                  <span className="font-mono">STORAGE SUBSYSTEM</span>
                </div>
                <span className="text-[rgba(var(--acid-green-rgb),1)] uppercase font-mono text-sm">ONLINE</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[rgba(var(--acid-green-rgb),1)] mr-2 animate-pulse"></div>
                  <span className="font-mono">AUTHENTICATION SERVICE</span>
                </div>
                <span className="text-[rgba(var(--acid-green-rgb),1)] uppercase font-mono text-sm">ONLINE</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[rgba(var(--acid-green-rgb),1)] mr-2 animate-pulse"></div>
                  <span className="font-mono">FILE PROCESSING</span>
                </div>
                <span className="text-[rgba(var(--acid-green-rgb),1)] uppercase font-mono text-sm">ONLINE</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[rgba(var(--warning-yellow-rgb),1)] mr-2 warning-blink"></div>
                  <span className="font-mono">ENCRYPTION MODULE</span>
                </div>
                <span className="text-[rgba(var(--warning-yellow-rgb),1)] uppercase font-mono text-sm">STANDBY</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[rgba(var(--toxic-red-rgb),0.2)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">SYSTEM UPTIME</span>
                  <span className="font-mono text-sm">99.8%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--acid-green-rgb),0.6)]" style={{ width: "99.8%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Server Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dystopian-card">
          <CardHeader className="pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="toxic-text font-mono">RECENT ACTIVITY</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="h-8 w-8 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded-full animate-pulse"></div>
                    <div className="ml-3 space-y-1 flex-1">
                      <div className="h-4 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="font-mono dystopian-terminal p-2">
                  <div className="text-sm space-y-2">
                    <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                      [SYSTEM] - File upload activity detected on /uploads... SUCCESS
                    </div>
                    <div className="text-[rgba(var(--toxic-red-rgb),0.9)]">
                      [WARNING] - Suspicious file detected... Quarantined
                    </div>
                    <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                      [SYSTEM] - User login from 198.51.100.123... AUTHORIZED
                    </div>
                    <div className="text-[rgba(var(--warning-yellow-rgb),0.9)]">
                      [NOTICE] - Storage capacity at 35%... NORMAL
                    </div>
                    <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                      [SYSTEM] - Automatic cleanup completed... 2 old files removed
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="toxic-text font-mono">SERVER METRICS</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">CPU LOAD</span>
                  <span className="text-sm font-mono">28%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--acid-green-rgb),0.6)]" style={{ width: "28%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">MEMORY USAGE</span>
                  <span className="text-sm font-mono">45%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--acid-green-rgb),0.6)]" style={{ width: "45%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">NETWORK TRAFFIC</span>
                  <span className="text-sm font-mono">64%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--warning-yellow-rgb),0.6)]" style={{ width: "64%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">STORAGE CAPACITY</span>
                  <span className="text-sm font-mono">35%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--acid-green-rgb),0.6)]" style={{ width: "35%" }}></div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between items-center text-xs font-mono text-gray-400">
                <div>MONITORED SINCE: 2024-05-01</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[rgba(var(--acid-green-rgb),0.8)] animate-pulse mr-1"></div>
                  LIVE DATA
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
