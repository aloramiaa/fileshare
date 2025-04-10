"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Upload, Menu, X, Database, User, Skull, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/contexts/settings-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { settings } = useSettings()
  const { siteName } = settings.display
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 scan-lines ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold flex items-center gap-2 transition-transform duration-300 hover:scale-105"
          data-text={siteName}
        >
          <div className="rounded-full p-2 bg-background/50 border border-[rgba(var(--toxic-red-rgb),0.5)] warning-flash">
            <Skull className="h-5 w-5 text-[hsl(var(--toxic-red))]" />
          </div>
          <span className="toxic-text dystopian-glitch" data-text={siteName}>
            {siteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium toxic-text transition-colors duration-300 hover:text-[hsl(var(--toxic-red))] font-mono"
          >
            HOME
          </Link>
          <Link
            href="/files"
            className="text-sm font-medium toxic-text transition-colors duration-300 hover:text-[hsl(var(--toxic-red))] font-mono"
          >
            MY FILES
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium toxic-text transition-colors duration-300 hover:text-[hsl(var(--toxic-red))] font-mono"
          >
            ABOUT
          </Link>

          {/* Admin link with special styling to indicate it's for admins only */}
          <Link
            href="/admin"
            className="text-sm font-medium flex items-center gap-1 acid-text transition-colors duration-300 hover:opacity-80 font-mono"
          >
            <AlertTriangle className="h-4 w-4" />
            ADMIN
          </Link>

          <Button asChild className="dystopian-button ml-4">
            <Link href="/upload" className="flex items-center gap-2 font-mono">
              <Upload className="h-4 w-4" />
              UPLOAD
            </Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[hsl(var(--toxic-red))]">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="dystopian-bg border-l border-[rgba(var(--toxic-red-rgb),0.5)] p-0 scan-lines"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
                  <Link href="/" className="text-xl font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <div className="rounded-full p-2 bg-background/50 border border-[rgba(var(--toxic-red-rgb),0.5)]">
                      <Skull className="h-5 w-5 text-[hsl(var(--toxic-red))]" />
                    </div>
                    <span className="toxic-text">{siteName}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-[hsl(var(--toxic-red))]"
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="flex flex-col p-4 gap-1">
                  <Link
                    href="/"
                    className="toxic-text py-3 px-4 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-all duration-300 flex items-center gap-3 font-mono"
                    onClick={() => setIsOpen(false)}
                  >
                    <Database className="h-5 w-5" />
                    <span>HOME</span>
                  </Link>
                  <Link
                    href="/files"
                    className="toxic-text py-3 px-4 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-all duration-300 flex items-center gap-3 font-mono"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>MY FILES</span>
                  </Link>
                  <Link
                    href="/about"
                    className="toxic-text py-3 px-4 rounded-md hover:bg-[rgba(var(--toxic-red-rgb),0.2)] transition-all duration-300 flex items-center gap-3 font-mono"
                    onClick={() => setIsOpen(false)}
                  >
                    <Database className="h-5 w-5" />
                    <span>ABOUT</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="acid-text py-3 px-4 rounded-md hover:bg-[rgba(var(--acid-green-rgb),0.2)] transition-all duration-300 flex items-center gap-3 font-mono"
                    onClick={() => setIsOpen(false)}
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span>ADMIN</span>
                  </Link>
                </nav>
                <div className="mt-auto p-4 border-t border-[rgba(var(--toxic-red-rgb),0.3)]">
                  <Button asChild className="w-full dystopian-button" onClick={() => setIsOpen(false)}>
                    <Link href="/upload" className="flex items-center justify-center gap-2 font-mono">
                      <Upload className="h-5 w-5" />
                      UPLOAD NOW
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
