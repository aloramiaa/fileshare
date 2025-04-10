"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

// Define types for our settings
export type StorageSettings = {
  maxFileSize: number
  allowedFileTypes: string
  autoDeleteDays: number
}

export type SecuritySettings = {
  publicAccess: boolean
  requirePassword: boolean
  enableEncryption: boolean
}

export type DisplaySettings = {
  siteName: string
  siteDescription: string
  primaryColor: string
}

export type AppSettings = {
  storage: StorageSettings
  security: SecuritySettings
  display: DisplaySettings
}

// Default settings
const defaultSettings: AppSettings = {
  storage: {
    maxFileSize: 100,
    allowedFileTypes: "*",
    autoDeleteDays: 0,
  },
  security: {
    publicAccess: true,
    requirePassword: false,
    enableEncryption: false,
  },
  display: {
    siteName: "FileShare",
    siteDescription: "Simple & Fast File Sharing",
    primaryColor: "#0070f3",
  },
}

// Create the context
type SettingsContextType = {
  settings: AppSettings
  loading: boolean
  error: string | null
  updateSettings: (section: keyof AppSettings, newSettings: any) => Promise<boolean>
  initializeSettings: () => Promise<boolean>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  error: null,
  updateSettings: async () => false,
  initializeSettings: async () => false,
})

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize settings
  const initializeSettings = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/settings/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        console.error("Error initializing settings:", data)
        return false
      }

      return true
    } catch (err) {
      console.error("Error initializing settings:", err)
      return false
    }
  }

  // Load settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        setError(null)

        // Check if settings table exists and has data
        const { data, error: tableError } = await supabase.from("settings").select("*")

        if (tableError) {
          console.error("Error loading settings:", tableError)

          // Try to initialize settings
          const initialized = await initializeSettings()
          if (initialized) {
            // Retry loading settings
            const { data: retryData, error: retryError } = await supabase.from("settings").select("*")

            if (retryError || !retryData || retryData.length === 0) {
              setError("Failed to load settings after initialization. Using defaults.")
              return
            }

            processSettingsData(retryData)
            return
          }

          setError("Failed to load settings. Using defaults.")
          return
        }

        if (!data || data.length === 0) {
          console.log("No settings found. Using defaults.")
          return
        }

        processSettingsData(data)
      } catch (err) {
        console.error("Error in loadSettings:", err)
        setError("An error occurred while loading settings. Using defaults.")
      } finally {
        setLoading(false)
      }
    }

    function processSettingsData(data: any[]) {
      // Process settings data
      const newSettings = { ...defaultSettings }

      data.forEach((row) => {
        if (row.key === "storage" || row.key === "security" || row.key === "display") {
          newSettings[row.key as keyof AppSettings] = {
            ...newSettings[row.key as keyof AppSettings],
            ...row.value,
          }
        }
      })

      setSettings(newSettings)

      // Apply display settings
      if (typeof document !== "undefined") {
        document.title = newSettings.display.siteName

        // Apply primary color to CSS variables
        document.documentElement.style.setProperty("--primary", newSettings.display.primaryColor)

        // Convert hex to RGB for opacity variants
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          return result
            ? {
                r: Number.parseInt(result[1], 16),
                g: Number.parseInt(result[2], 16),
                b: Number.parseInt(result[3], 16),
              }
            : { r: 0, g: 112, b: 243 } // Default blue
        }

        const rgb = hexToRgb(newSettings.display.primaryColor)
        document.documentElement.style.setProperty("--primary-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`)
      }
    }

    loadSettings()
  }, [])

  // Function to update settings
  const updateSettings = async (section: keyof AppSettings, newSettings: any): Promise<boolean> => {
    try {
      // Update in database
      const { error } = await supabase
        .from("settings")
        .upsert({ key: section, value: newSettings }, { onConflict: "key" })

      if (error) {
        console.error(`Error updating ${section} settings:`, error)
        return false
      }

      // Update local state
      setSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          ...newSettings,
        },
      }))

      // Apply display settings immediately if updated
      if (section === "display" && typeof document !== "undefined") {
        document.title = newSettings.siteName || settings.display.siteName

        if (newSettings.primaryColor) {
          document.documentElement.style.setProperty("--primary", newSettings.primaryColor)

          // Convert hex to RGB for opacity variants
          const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result
              ? {
                  r: Number.parseInt(result[1], 16),
                  g: Number.parseInt(result[2], 16),
                  b: Number.parseInt(result[3], 16),
                }
              : { r: 0, g: 112, b: 243 } // Default blue
          }

          const rgb = hexToRgb(newSettings.primaryColor)
          document.documentElement.style.setProperty("--primary-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`)
        }
      }

      return true
    } catch (err) {
      console.error(`Error in updateSettings (${section}):`, err)
      return false
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSettings, initializeSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

// Custom hook to use the settings context
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
