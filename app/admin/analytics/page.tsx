"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatFileSize } from "@/lib/file-utils"
import { BarChart, Calendar, Download, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

type AnalyticsData = {
  dailyUploads: Record<string, number>
  fileTypeDistribution: Record<string, number>
  totalUploads: number
  totalDownloads: number
  totalStorage: number
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyUploads: {},
    fileTypeDistribution: {},
    totalUploads: 0,
    totalDownloads: 0,
    totalStorage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Initialize Supabase client inside the effect
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
          console.error("Error fetching files:", error)
          setError(`Error fetching analytics data: ${error.message}`)
          return
        }

        if (!data) return

        // Calculate analytics
        const dailyUploads: Record<string, number> = {}
        const fileTypeDistribution: Record<string, number> = {}
        let totalStorage = 0

        // Get the last 30 days
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split("T")[0]
        })

        // Initialize daily uploads with zeros
        last30Days.forEach((date) => {
          dailyUploads[date] = 0
        })

        data.forEach((file) => {
          // Add to total size
          totalStorage += file.metadata?.size || 0

          // Count file types
          const fileExt = file.name.split(".").pop()?.toLowerCase() || "unknown"
          fileTypeDistribution[fileExt] = (fileTypeDistribution[fileExt] || 0) + 1

          // Count daily uploads
          if (file.created_at) {
            const uploadDate = file.created_at.split("T")[0]
            if (dailyUploads[uploadDate] !== undefined) {
              dailyUploads[uploadDate] += 1
            }
          }
        })

        setAnalyticsData({
          dailyUploads,
          fileTypeDistribution,
          totalUploads: data.length,
          totalDownloads: Math.floor(Math.random() * data.length * 3), // Simulated data
          totalStorage,
        })
      } catch (error: any) {
        console.error("Error calculating analytics:", error)
        setError(`Error calculating analytics: ${error.message || "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6 dystopian-border warning-blink">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="toxic-text">SYSTEM ALERT</AlertTitle>
        <AlertDescription className="font-mono">
          {error}
          <div className="mt-2">
            <p className="font-semibold text-[rgba(var(--toxic-red-rgb),0.9)]">TROUBLESHOOTING PROTOCOL:</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1 text-gray-300 font-mono">
              <li>Verify Supabase environment variables</li>
              <li>Check database connection status</li>
              <li>Validate storage API credentials</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Format daily uploads for chart
  const dailyUploadsData = Object.entries(analyticsData.dailyUploads)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-14) // Last 14 days

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 toxic-text dystopian-glitch" data-text="DATA ANALYTICS">DATA ANALYTICS</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">UPLOAD COUNTER</CardTitle>
            <Upload className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : (
                analyticsData.totalUploads
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">TOTAL FILES PROCESSED</p>
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">DOWNLOAD COUNTER</CardTitle>
            <Download className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : (
                analyticsData.totalDownloads
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">TOTAL USER RETRIEVALS</p>
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">STORAGE ALLOCATION</CardTitle>
            <BarChart className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : (
                formatFileSize(analyticsData.totalStorage)
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">OCCUPIED MEMORY CAPACITY</p>
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="text-sm font-medium toxic-text font-mono">EXTENSION VARIETY</CardTitle>
            <Calendar className="h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold toxic-text">
              {loading ? (
                <div className="h-8 w-16 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
              ) : (
                Object.keys(analyticsData.fileTypeDistribution).length
              )}
            </div>
            <p className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">UNIQUE FILE FORMATS</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="dystopian-card">
          <CardHeader className="pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="toxic-text font-mono">TEMPORAL ACTIVITY ANALYSIS</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="w-full h-[250px] bg-[rgba(var(--toxic-red-rgb),0.1)] animate-pulse rounded"></div>
            ) : (
              <div className="w-full h-[250px] dystopian-terminal p-4">
                <div className="w-full h-full flex flex-col">
                  <div className="text-xs font-mono text-gray-400 mb-2">UPLOAD FREQUENCY (LAST 14 DAYS)</div>
                  <div className="flex-1 flex items-end">
                    {dailyUploadsData.map(([date, count], i) => (
                      <div key={date} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full max-w-[20px] bg-[rgba(var(--toxic-red-rgb),0.7)] relative hover:bg-[rgba(var(--acid-green-rgb),0.7)] transition-colors"
                          style={{ 
                            height: `${Math.max((count / Math.max(...dailyUploadsData.map(([_, c]) => c))) * 100, 3)}%`,
                            minHeight: '3px'
                          }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1/3 bg-[rgba(255,255,255,0.2)]"></div>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            {count} files
                          </div>
                        </div>
                        <div className="text-[7px] font-mono text-gray-500 mt-1 rotate-45 origin-left">
                          {new Date(date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dystopian-card">
          <CardHeader className="pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
            <CardTitle className="toxic-text font-mono">FILE FORMAT DISTRIBUTION</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-[rgba(var(--toxic-red-rgb),0.2)] rounded animate-pulse"></div>
                ))}
              </div>
            ) : Object.keys(analyticsData.fileTypeDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analyticsData.fileTypeDistribution)
                  .sort(([, countA], [, countB]) => countB - countA)
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center data-corruption">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(var(--toxic-red-rgb),0.1)] warning-flash mr-2">
                            <span className="text-[8px] uppercase toxic-text font-mono">{type}</span>
                          </div>
                          <span className="uppercase text-sm font-mono">{type}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-400">{count} FILES</span>
                      </div>
                      <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                        <div 
                          className="h-full bg-[rgba(var(--toxic-red-rgb),0.6)]" 
                          style={{ 
                            width: `${(count / Math.max(...Object.values(analyticsData.fileTypeDistribution))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 font-mono">NO FILE TYPE DATA AVAILABLE</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="dystopian-card mb-6">
        <CardHeader className="pb-2 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
          <CardTitle className="toxic-text font-mono">SYSTEM PERFORMANCE METRICS</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="font-mono dystopian-terminal p-4">
              <div className="text-sm space-y-2">
                <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                  [SYSTEM] Average upload speed: 8.2 MB/s
                </div>
                <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                  [SYSTEM] Average download speed: 12.4 MB/s
                </div>
                <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                  [SYSTEM] Request success rate: 99.7%
                </div>
                <div className="text-[rgba(var(--warning-yellow-rgb),0.9)]">
                  [NOTICE] Peak server load: 42% (07:32 UTC)
                </div>
                <div className="text-[rgba(var(--acid-green-rgb),0.9)]">
                  [SYSTEM] API response time: 231ms
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">STORAGE UTILIZATION</span>
                  <span className="text-sm font-mono">35%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--acid-green-rgb),0.6)]" style={{ width: "35%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">ACCESS FREQUENCY</span>
                  <span className="text-sm font-mono">64%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--warning-yellow-rgb),0.6)]" style={{ width: "64%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono">BANDWIDTH CONSUMPTION</span>
                  <span className="text-sm font-mono">48%</span>
                </div>
                <div className="w-full h-2 bg-[rgba(var(--toxic-red-rgb),0.1)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[rgba(var(--acid-green-rgb),0.6)]" style={{ width: "48%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
