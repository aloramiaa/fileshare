"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Shield, Zap, Lock, FileUp, AlertTriangle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/contexts/settings-context"
import { Skeleton } from "@/components/ui/skeleton"
import FileUploader from "@/components/file-uploader"

export default function Home() {
  const { settings, loading } = useSettings()
  const { siteName, siteDescription } = settings.display

  // Refs for scroll animations
  const revealRefs = useRef<HTMLElement[]>([])

  // Add to refs array
  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      revealRefs.current.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight * 0.85
        if (isVisible) {
          el.classList.add("active")
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    // Initial check
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="digital-noise">
      {/* Hero Section with dystopian cyberpunk theme */}
      <section className="relative overflow-hidden py-16 md:py-24 dystopian-bg surveillance-bg">
        {/* Animated elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full dystopian-grid opacity-20"></div>
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[rgba(var(--toxic-red-rgb),0.1)] blur-3xl animate-float"></div>
          <div
            className="absolute top-60 -left-20 h-60 w-60 rounded-full bg-[rgba(var(--acid-green-rgb),0.1)] blur-3xl animate-float"
            style={{ animationDelay: "-2s" }}
          ></div>
          <div
            className="absolute bottom-20 right-20 h-40 w-40 rounded-full bg-[rgba(var(--digital-blue-rgb),0.1)] blur-3xl animate-float"
            style={{ animationDelay: "-4s" }}
          ></div>
        </div>

        <div className="container relative mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <>
                <Skeleton className="h-12 w-2/3 mx-auto mb-6" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
              </>
            ) : (
              <>
                <h1
                  className="text-4xl md:text-5xl font-bold mb-4 toxic-text text-center dystopian-glitch"
                  data-text={siteName}
                >
                  {siteName}
                </h1>
                <p className="text-xl text-center mb-8 acid-text font-mono">SECURE • BLAZING FAST • ENCRYPTED</p>
              </>
            )}

            {/* Main Upload Component */}
            <div className="dystopian-card p-6 rounded-lg animate-fade-in">
              <FileUploader />
            </div>

            {/* Security Features */}
            <div className="mt-16 grid md:grid-cols-3 gap-6">
              <div
                ref={addToRefs as any}
                className="dystopian-card p-6 rounded-lg reveal reveal-delay-1 warning-stripes"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center mb-4 warning-flash">
                    <Shield className="h-8 w-8 text-[hsl(var(--toxic-red))]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 toxic-text font-mono">SECURE STORAGE</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    MILITARY-GRADE ENCRYPTION PROTECTS YOUR FILES FROM UNAUTHORIZED ACCESS
                  </p>
                </div>
              </div>

              <div
                ref={addToRefs as any}
                className="dystopian-card p-6 rounded-lg reveal reveal-delay-2 warning-stripes"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(var(--acid-green-rgb),0.2)] flex items-center justify-center mb-4 warning-flash">
                    <Zap className="h-8 w-8 text-[hsl(var(--acid-green))]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 acid-text font-mono">BLAZING FAST</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    OPTIMIZED SERVERS ENSURE YOUR FILES UPLOAD AND DOWNLOAD AT MAXIMUM SPEED
                  </p>
                </div>
              </div>

              <div
                ref={addToRefs as any}
                className="dystopian-card p-6 rounded-lg reveal reveal-delay-3 warning-stripes"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(var(--warning-yellow-rgb),0.2)] flex items-center justify-center mb-4 warning-flash">
                    <Lock className="h-8 w-8 text-[hsl(var(--warning-yellow))]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 warning-text font-mono">PRIVATE ACCESS</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    PASSWORD PROTECTION AND EXPIRATION CONTROLS FOR YOUR SENSITIVE FILES
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 dystopian-gradient surveillance-bg">
        <div className="container mx-auto px-4">
          <h2 ref={addToRefs as any} className="text-3xl font-bold text-center mb-16 toxic-text reveal font-mono">
            SYSTEM PROTOCOL
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div ref={addToRefs as any} className="dystopian-card p-6 rounded-lg reveal reveal-delay-1">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-[rgba(var(--toxic-red-rgb),0.2)] flex items-center justify-center border border-[rgba(var(--toxic-red-rgb),0.5)] warning-flash">
                  <span className="text-2xl font-bold toxic-text font-mono">01</span>
                </div>
                <div className="pt-10">
                  <h3 className="text-lg font-bold mb-4 toxic-text font-mono">UPLOAD</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    DRAG AND DROP YOUR FILES OR BROWSE TO SELECT. SUPPORTS ALL FILE TYPES UP TO 100MB.
                  </p>
                </div>
              </div>
            </div>

            <div ref={addToRefs as any} className="dystopian-card p-6 rounded-lg reveal reveal-delay-2">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-[rgba(var(--acid-green-rgb),0.2)] flex items-center justify-center border border-[rgba(var(--acid-green-rgb),0.5)] warning-flash">
                  <span className="text-2xl font-bold acid-text font-mono">02</span>
                </div>
                <div className="pt-10">
                  <h3 className="text-lg font-bold mb-4 acid-text font-mono">SHARE</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    GET AN INSTANT SHAREABLE LINK. OPTIONALLY SET A PASSWORD OR EXPIRATION DATE.
                  </p>
                </div>
              </div>
            </div>

            <div ref={addToRefs as any} className="dystopian-card p-6 rounded-lg reveal reveal-delay-3">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-[rgba(var(--warning-yellow-rgb),0.2)] flex items-center justify-center border border-[rgba(var(--warning-yellow-rgb),0.5)] warning-flash">
                  <span className="text-2xl font-bold warning-text font-mono">03</span>
                </div>
                <div className="pt-10">
                  <h3 className="text-lg font-bold mb-4 warning-text font-mono">ACCESS</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    RECIPIENTS CAN VIEW OR DOWNLOAD YOUR FILES INSTANTLY FROM ANY DEVICE.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 dystopian-bg surveillance-bg border-t border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
        <div className="container mx-auto px-4 text-center">
          <h2 ref={addToRefs as any} className="text-3xl font-bold mb-6 toxic-text reveal font-mono">
            READY TO UPLOAD?
          </h2>
          <p
            ref={addToRefs as any}
            className="text-lg max-w-2xl mx-auto mb-8 text-gray-400 reveal reveal-delay-1 font-mono"
          >
            JOIN THOUSANDS OF USERS WHO TRUST {loading ? "FILESHARE" : siteName.toUpperCase()} FOR THEIR SECURE FILE
            SHARING NEEDS.
          </p>
          <div className="dystopian-terminal inline-block p-6 mb-8 reveal reveal-delay-2">
            <div className="dystopian-terminal-text text-sm md:text-base font-mono">
              $ ./upload --secure --blazing-fast --encrypted
            </div>
          </div>
          <div>
            <Button
              ref={addToRefs as any}
              size="lg"
              className="acid-button text-lg px-8 py-6 reveal reveal-delay-3"
              asChild
            >
              <Link href="/upload" className="flex items-center gap-2 font-mono">
                <FileUp className="h-5 w-5" />
                START UPLOADING NOW
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-12 bg-[rgba(var(--toxic-red-rgb),0.05)] border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--toxic-red-rgb),0.1)] flex items-center justify-center warning-flash">
              <AlertTriangle className="h-6 w-6 text-[hsl(var(--toxic-red))]" />
            </div>
          </div>
          <h3 className="text-xl font-bold toxic-text mb-2 font-mono">WARNING</h3>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto font-mono">
            ALL UPLOADS ARE MONITORED. ILLEGAL CONTENT WILL BE REPORTED TO AUTHORITIES. USE AT YOUR OWN RISK. SYSTEM
            ADMINISTRATORS RESERVE THE RIGHT TO DELETE ANY CONTENT WITHOUT NOTICE.
          </p>
        </div>
      </section>

      {/* Surveillance Footer */}
      <section className="py-8 bg-[rgba(var(--cyber-black-rgb),0.8)] border-b border-[rgba(var(--toxic-red-rgb),0.3)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Eye className="h-4 w-4 text-[hsl(var(--toxic-red))]" />
              <span className="ml-2 text-xs text-gray-500 font-mono">SYSTEM MONITORING ACTIVE</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 font-mono">
                USER ID: 241063
              </span>
              <span className="mx-2 text-gray-600">|</span>
              <span className="text-xs text-gray-500 font-mono">SESSION TRACKED</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
