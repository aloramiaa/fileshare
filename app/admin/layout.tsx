"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Files, Settings, BarChart3, Trash2, LogOut, Shield, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      toast({
        title: "LOGGED OUT",
        description: "You have been disconnected from the system",
      })

      // Redirect to home page
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "ERROR",
        description: "Failed to terminate session",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen dystopian-bg scan-lines">
      {/* Sidebar */}
      <div className="w-64 bg-[rgba(var(--cyber-black-rgb),0.7)] border-r border-[rgba(var(--toxic-red-rgb),0.3)] hidden md:block relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[rgba(var(--toxic-red-rgb),0.7)] animate-warning-flash"></div>
        <div className="p-6 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
          <h2 className="text-xl font-bold toxic-text flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            ADMIN TERMINAL
          </h2>
          <div className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] mt-1 font-mono">ACCESS LEVEL: RESTRICTED</div>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-[rgba(var(--toxic-red-rgb),0.5)] hover:bg-[rgba(var(--toxic-red-rgb),0.1)] text-gray-300 font-medium transition-all duration-200 group"
                onClick={() => {
                  router.push("/admin")
                }}
              >
                <LayoutDashboard className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)] group-hover:animate-pulse" />
                <span className="font-mono tracking-wide">DASHBOARD</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/files"
                className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-[rgba(var(--toxic-red-rgb),0.5)] hover:bg-[rgba(var(--toxic-red-rgb),0.1)] text-gray-300 font-medium transition-all duration-200 group"
                onClick={() => {
                  router.push("/admin/files")
                }}
              >
                <Files className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)] group-hover:animate-pulse" />
                <span className="font-mono tracking-wide">FILES</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-[rgba(var(--toxic-red-rgb),0.5)] hover:bg-[rgba(var(--toxic-red-rgb),0.1)] text-gray-300 font-medium transition-all duration-200 group"
                onClick={() => {
                  router.push("/admin/analytics")
                }}
              >
                <BarChart3 className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)] group-hover:animate-pulse" />
                <span className="font-mono tracking-wide">ANALYTICS</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/trash"
                className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-[rgba(var(--toxic-red-rgb),0.5)] hover:bg-[rgba(var(--toxic-red-rgb),0.1)] text-gray-300 font-medium transition-all duration-200 group"
                onClick={() => {
                  router.push("/admin/trash")
                }}
              >
                <Trash2 className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)] group-hover:animate-pulse" />
                <span className="font-mono tracking-wide">TRASH</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-[rgba(var(--toxic-red-rgb),0.5)] hover:bg-[rgba(var(--toxic-red-rgb),0.1)] text-gray-300 font-medium transition-all duration-200 group"
                onClick={() => {
                  router.push("/admin/settings")
                }}
              >
                <Settings className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)] group-hover:animate-pulse" />
                <span className="font-mono tracking-wide">SETTINGS</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[rgba(var(--toxic-red-rgb),0.3)] bg-[rgba(var(--cyber-black-rgb),0.5)]">
          <div className="text-xs text-[rgba(var(--toxic-red-rgb),0.7)] mb-2 font-mono flex items-center">
            <div className="w-2 h-2 rounded-full bg-[rgba(var(--toxic-red-rgb),0.8)] mr-2 animate-pulse"></div>
            SYSTEM MONITORING ACTIVE
          </div>
          <Button variant="outline" className="w-full dystopian-button" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            TERMINATE SESSION
          </Button>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="md:hidden p-4 border-b border-[rgba(var(--toxic-red-rgb),0.3)] w-full bg-[rgba(var(--cyber-black-rgb),0.7)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold toxic-text flex items-center">
            <Terminal className="mr-2 h-5 w-5" />
            ADMIN
          </h2>
          <div className="flex gap-4">
            <Link href="/admin" className="p-2 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-colors">
              <LayoutDashboard className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)]" />
            </Link>
            <Link
              href="/admin/files"
              className="p-2 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-colors"
            >
              <Files className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)]" />
            </Link>
            <Link
              href="/admin/analytics"
              className="p-2 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)]" />
            </Link>
            <Link
              href="/admin/settings"
              className="p-2 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-colors"
            >
              <Settings className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)]" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-colors"
            >
              <LogOut className="h-5 w-5 text-[rgba(var(--toxic-red-rgb),0.8)]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto dystopian-bg">
        <div className="p-6 relative">
          <div className="absolute top-0 left-0 w-full h-full surveillance-bg pointer-events-none"></div>
          {children}
        </div>
      </div>
    </div>
  )
}
