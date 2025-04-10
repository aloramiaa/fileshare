"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { createClient } from "@supabase/supabase-js"

export default function SettingsPage() {
  const { settings, loading, error: contextError, updateSettings } = useSettings()
  const [saving, setSaving] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  // Storage settings state
  const [maxFileSize, setMaxFileSize] = useState(settings.storage.maxFileSize)
  const [allowedFileTypes, setAllowedFileTypes] = useState(settings.storage.allowedFileTypes)
  const [autoDeleteDays, setAutoDeleteDays] = useState(settings.storage.autoDeleteDays)

  // Security settings state
  const [publicAccess, setPublicAccess] = useState(settings.security.publicAccess)
  const [requirePassword, setRequirePassword] = useState(settings.security.requirePassword)
  const [enableEncryption, setEnableEncryption] = useState(settings.security.enableEncryption)

  // Display settings state
  const [siteName, setSiteName] = useState(settings.display.siteName)
  const [siteDescription, setSiteDescription] = useState(settings.display.siteDescription)
  const [primaryColor, setPrimaryColor] = useState(settings.display.primaryColor)

  // Initialize Supabase client for operations not handled by the context
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Update local state when settings from context change
  if (!loading && !saving) {
    if (maxFileSize !== settings.storage.maxFileSize) setMaxFileSize(settings.storage.maxFileSize)
    if (allowedFileTypes !== settings.storage.allowedFileTypes) setAllowedFileTypes(settings.storage.allowedFileTypes)
    if (autoDeleteDays !== settings.storage.autoDeleteDays) setAutoDeleteDays(settings.storage.autoDeleteDays)

    if (publicAccess !== settings.security.publicAccess) setPublicAccess(settings.security.publicAccess)
    if (requirePassword !== settings.security.requirePassword) setRequirePassword(settings.security.requirePassword)
    if (enableEncryption !== settings.security.enableEncryption) setEnableEncryption(settings.security.enableEncryption)

    if (siteName !== settings.display.siteName) setSiteName(settings.display.siteName)
    if (siteDescription !== settings.display.siteDescription) setSiteDescription(settings.display.siteDescription)
    if (primaryColor !== settings.display.primaryColor) setPrimaryColor(settings.display.primaryColor)
  }

  const saveSettings = async (section: string) => {
    setSaving(true)
    try {
      let success = false

      switch (section) {
        case "Storage":
          success = await updateSettings("storage", {
            maxFileSize,
            allowedFileTypes,
            autoDeleteDays,
          })
          break
        case "Security":
          success = await updateSettings("security", {
            publicAccess,
            requirePassword,
            enableEncryption,
          })
          break
        case "Display":
          success = await updateSettings("display", {
            siteName,
            siteDescription,
            primaryColor,
          })
          break
      }

      if (success) {
        toast({
          title: "Settings saved",
          description: `${section} settings have been updated.`,
        })
      } else {
        throw new Error(`Failed to save ${section} settings`)
      }
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error)
      toast({
        title: "Error",
        description: `Failed to save ${section} settings: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 toxic-text dystopian-glitch" data-text="SYSTEM CONFIGURATION">SYSTEM CONFIGURATION</h1>

      {(contextError || setupError) && (
        <Alert variant="destructive" className="mb-6 dystopian-border warning-blink">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="toxic-text">SYSTEM ALERT</AlertTitle>
          <AlertDescription className="font-mono">
            {contextError || setupError}
            <div className="mt-2">
              <p className="text-[rgba(var(--toxic-red-rgb),0.9)]">DIAGNOSTIC PROCEDURE:</p>
              <ol className="list-decimal ml-5 mt-2 text-gray-300">
                <li>Verify Supabase configuration integrity</li>
                <li>Validate database access permissions</li>
                <li>Initiate system refresh sequence</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="storage" className="space-y-6">
        <TabsList className="dystopian-card border border-[rgba(var(--toxic-red-rgb),0.3)] bg-[rgba(var(--cyber-black-rgb),0.7)]">
          <TabsTrigger value="storage" className="data-corruption font-mono text-gray-300 hover:text-[rgba(var(--toxic-red-rgb),0.9)]">STORAGE</TabsTrigger>
          <TabsTrigger value="security" className="data-corruption font-mono text-gray-300 hover:text-[rgba(var(--toxic-red-rgb),0.9)]">SECURITY</TabsTrigger>
          <TabsTrigger value="display" className="data-corruption font-mono text-gray-300 hover:text-[rgba(var(--toxic-red-rgb),0.9)]">DISPLAY</TabsTrigger>
          <TabsTrigger value="advanced" className="data-corruption font-mono text-gray-300 hover:text-[rgba(var(--toxic-red-rgb),0.9)]">ADVANCED</TabsTrigger>
        </TabsList>

        {/* Storage Settings */}
        <TabsContent value="storage">
          <Card className="dystopian-card border border-[rgba(var(--toxic-red-rgb),0.3)] bg-[rgba(var(--cyber-black-rgb),0.7)]">
            <CardHeader className="border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
              <CardTitle className="toxic-text font-mono">STORAGE PARAMETERS</CardTitle>
              <CardDescription className="text-gray-400 font-mono">CONFIGURE DIGITAL ASSET MANAGEMENT PROTOCOL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="max-file-size" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">MAXIMUM FILE SIZE (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(Number.parseInt(e.target.value))}
                  className="dystopian-input font-mono"
                />
                <p className="text-sm text-gray-500 font-mono">DEFINES UPPER THRESHOLD FOR UPLOAD CAPACITY</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-file-types" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">PERMITTED FILE FORMATS</Label>
                <Input
                  id="allowed-file-types"
                  value={allowedFileTypes}
                  onChange={(e) => setAllowedFileTypes(e.target.value)}
                  placeholder="e.g., jpg,png,pdf or * for all"
                  className="dystopian-input font-mono"
                />
                <p className="text-sm text-gray-500 font-mono">COMMA-SEPARATED LIST OF ALLOWED EXTENSIONS, USE * FOR UNIVERSAL ACCESS</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-delete" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">AUTO-PURGE INTERVAL (DAYS)</Label>
                <Input
                  id="auto-delete"
                  type="number"
                  value={autoDeleteDays}
                  onChange={(e) => setAutoDeleteDays(Number.parseInt(e.target.value))}
                  className="dystopian-input font-mono"
                />
                <p className="text-sm text-gray-500 font-mono">AUTOMATIC DATA PURGE TIMER. SET TO 0 FOR PERMANENT STORAGE</p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-[rgba(var(--toxic-red-rgb),0.3)] pt-4">
              <Button onClick={() => saveSettings("Storage")} disabled={saving} className="dystopian-button font-mono">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SYNCING...</> : <>COMMIT STORAGE PARAMETERS</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="dystopian-card border border-[rgba(var(--toxic-red-rgb),0.3)] bg-[rgba(var(--cyber-black-rgb),0.7)]">
            <CardHeader className="border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
              <CardTitle className="toxic-text font-mono">SECURITY PARAMETERS</CardTitle>
              <CardDescription className="text-gray-400 font-mono">CONFIGURE DIGITAL SECURITY PROTOCOL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-access" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">PUBLIC ACCESS</Label>
                  <p className="text-sm text-gray-500 font-mono">ALLOW ANYONE TO ACCESS UPLOADED FILES WITHOUT AUTHENTICATION</p>
                </div>
                <Switch id="public-access" checked={publicAccess} onCheckedChange={setPublicAccess} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-password" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">REQUIRE PASSWORD FOR DOWNLOADS</Label>
                  <p className="text-sm text-gray-500 font-mono">REQUIRE A PASSWORD TO DOWNLOAD FILES</p>
                </div>
                <Switch id="require-password" checked={requirePassword} onCheckedChange={setRequirePassword} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-encryption" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">ENABLE ENCRYPTION</Label>
                  <p className="text-sm text-gray-500 font-mono">ENCRYPT FILES AT REST FOR ADDITIONAL SECURITY</p>
                </div>
                <Switch id="enable-encryption" checked={enableEncryption} onCheckedChange={setEnableEncryption} />
              </div>
            </CardContent>
            <CardFooter className="border-t border-[rgba(var(--toxic-red-rgb),0.3)] pt-4">
              <Button onClick={() => saveSettings("Security")} disabled={saving} className="dystopian-button font-mono">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SYNCING...</> : <>COMMIT SECURITY PARAMETERS</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display">
          <Card className="dystopian-card border border-[rgba(var(--toxic-red-rgb),0.3)] bg-[rgba(var(--cyber-black-rgb),0.7)]">
            <CardHeader className="border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
              <CardTitle className="toxic-text font-mono">DISPLAY PARAMETERS</CardTitle>
              <CardDescription className="text-gray-400 font-mono">CUSTOMIZE FILE SHARING SITE APPEARANCE</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="site-name" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">SITE NAME</Label>
                <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="dystopian-input font-mono" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">SITE DESCRIPTION</Label>
                <Input
                  id="site-description"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="dystopian-input font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">PRIMARY COLOR</Label>
                <div className="flex gap-2">
                  <Input id="primary-color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="dystopian-input font-mono" />
                  <div className="h-10 w-10 rounded border" style={{ backgroundColor: primaryColor }}></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-[rgba(var(--toxic-red-rgb),0.3)] pt-4">
              <Button onClick={() => saveSettings("Display")} disabled={saving} className="dystopian-button font-mono">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SYNCING...</> : <>COMMIT DISPLAY PARAMETERS</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card className="dystopian-card border border-[rgba(var(--toxic-red-rgb),0.3)] bg-[rgba(var(--cyber-black-rgb),0.7)]">
            <CardHeader className="border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
              <CardTitle className="toxic-text font-mono">ADVANCED PARAMETERS</CardTitle>
              <CardDescription className="text-gray-400 font-mono">CONFIGURE ADVANCED OPTIONS FOR FILE SHARING SYSTEM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">API KEY</Label>
                <div className="flex gap-2">
                  <Input id="api-key" value="••••••••••••••••••••••••••••••" readOnly className="dystopian-input font-mono" />
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "API Key Regenerated",
                        description: "A new API key has been generated.",
                      })
                    }}
                    className="dystopian-button font-mono"
                  >
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-gray-500 font-mono">USE THIS KEY TO ACCESS THE API PROGRAMMATICALLY</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">DANGER ZONE</h3>
                <div className="border border-destructive/20 rounded-md p-4">
                  <h4 className="font-medium text-destructive mb-2 text-[rgba(var(--toxic-red-rgb),0.9)] font-mono">CLEAR ALL FILES</h4>
                  <p className="text-sm text-gray-500 font-mono mb-4">
                    THIS WILL PERMANENTLY DELETE ALL FILES IN THE SYSTEM. THIS ACTION CANNOT BE UNDONE.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete all files? This action cannot be undone.")) {
                        setSaving(true)
                        try {
                          // Get all files
                          const { data: files } = await supabase.storage.from("files").list("uploads")

                          if (files && files.length > 0) {
                            // Delete all files
                            const filePaths = files.map((file) => `uploads/${file.name}`)
                            await supabase.storage.from("files").remove(filePaths)

                            toast({
                              title: "All Files Deleted",
                              description: `Successfully deleted ${files.length} files.`,
                            })
                          } else {
                            toast({
                              title: "No Files Found",
                              description: "There are no files to delete.",
                            })
                          }
                        } catch (error) {
                          console.error("Error deleting all files:", error)
                          toast({
                            title: "Error",
                            description: "Failed to delete all files.",
                            variant: "destructive",
                          })
                        } finally {
                          setSaving(false)
                        }
                      }
                    }}
                    disabled={saving}
                    className="dystopian-button font-mono"
                  >
                    {saving ? "Processing..." : "Delete All Files"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
