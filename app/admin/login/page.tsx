"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle, Shield, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/admin"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Authentication failed")
      }

      // Force a hard refresh to ensure the cookie is recognized
      window.location.href = from
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center dystopian-bg scan-lines">
      <div className="absolute inset-0 surveillance-bg"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-[rgba(var(--toxic-red-rgb),0.7)] animate-warning-flash"></div>

      <Card className="w-full max-w-md dystopian-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[rgba(var(--toxic-red-rgb),0.7)] animate-warning-flash"></div>

        <CardHeader className="space-y-1 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold toxic-text flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              ADMIN ACCESS
            </CardTitle>
            <div className="px-2 py-1 bg-[rgba(var(--toxic-red-rgb),0.2)] text-xs font-mono text-[rgba(var(--toxic-red-rgb),0.8)] border border-[rgba(var(--toxic-red-rgb),0.5)] animate-pulse">
              SECURE
            </div>
          </div>
          <CardDescription className="font-mono text-gray-400">
            Enter security credentials to access the system
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4 dystopian-border warning-blink">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono">ACCESS DENIED: {error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="toxic-text">
                  SECURITY KEY
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[rgba(var(--toxic-red-rgb),0.8)]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="ENTER ADMIN CREDENTIALS"
                    className="pl-10 pr-10 dystopian-input font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[rgba(var(--toxic-red-rgb),0.8)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full dystopian-button" disabled={loading}>
                {loading ? "AUTHENTICATING..." : "INITIATE LOGIN SEQUENCE"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-[rgba(var(--toxic-red-rgb),0.3)] px-6 py-4">
          <div className="w-full">
            <p className="text-xs text-center w-full text-[rgba(var(--toxic-red-rgb),0.7)] font-mono">
              RESTRICTED AREA - UNAUTHORIZED ACCESS WILL BE TRACED
            </p>
            <div className="text-[8px] text-center mt-2 text-gray-500 font-mono">
              IP LOGGED: {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.
              {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
