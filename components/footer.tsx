"use client"

import Link from "next/link"
import { Github, Twitter, Mail, Skull, ExternalLink, Eye, AlertTriangle } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export function Footer() {
  const { settings } = useSettings()
  const { siteName } = settings.display
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto dystopian-bg border-t border-[rgba(var(--toxic-red-rgb),0.3)] scan-lines">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2 mb-4 hover:text-[hsl(var(--toxic-red))] transition-colors duration-300"
            >
              <span className="toxic-text" data-text={siteName}>
                {siteName}
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 font-mono">
              SECURE, FAST, AND ENCRYPTED FILE SHARING FOR THE DIGITAL AGE. UPLOAD, SHARE, AND PROTECT YOUR DATA WITH
              MILITARY-GRADE ENCRYPTION.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[hsl(var(--toxic-red))] transition-colors duration-300 hover:scale-110 transform"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[hsl(var(--toxic-red))] transition-colors duration-300 hover:scale-110 transform"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-6 relative inline-block">
              <span className="toxic-text font-mono">NAVIGATION</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgba(var(--toxic-red-rgb),0.5)]"></div>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[hsl(var(--toxic-red))] transition-colors duration-300 flex items-center group font-mono"
                >
                  <span>HOME</span>
                  <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="text-gray-400 hover:text-[hsl(var(--toxic-red))] transition-colors duration-300 flex items-center group font-mono"
                >
                  <span>UPLOAD</span>
                  <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/files"
                  className="text-gray-400 hover:text-[hsl(var(--toxic-red))] transition-colors duration-300 flex items-center group font-mono"
                >
                  <span>MY FILES</span>
                  <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-[hsl(var(--toxic-red))] transition-colors duration-300 flex items-center group font-mono"
                >
                  <span>ABOUT</span>
                  <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-6 relative inline-block">
              <span className="acid-text font-mono">CONTACT</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgba(var(--acid-green-rgb),0.5)]"></div>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400 group">
                <Mail className="h-4 w-4 mr-2 group-hover:text-[hsl(var(--acid-green))] transition-colors duration-300" />
                <a
                  href="mailto:xaloramia@gmail.com"
                  className="hover:text-[hsl(var(--acid-green))] transition-colors duration-300 font-mono"
                >
                  xaloramia@gmail.com
                </a>
              </li>
              <li className="flex items-center text-gray-400 group mt-4">
                <AlertTriangle className="h-4 w-4 mr-2 group-hover:text-[hsl(var(--acid-green))] transition-colors duration-300" />
                <a
                  href="/security"
                  className="hover:text-[hsl(var(--acid-green))] transition-colors duration-300 font-mono"
                >
                  SECURITY INFORMATION
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(var(--toxic-red-rgb),0.3)] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 font-mono">
            © {currentYear} {siteName}. ALL RIGHTS RESERVED.
          </div>
          <div className="text-sm text-gray-500 mt-4 md:mt-0 flex items-center">
            <span className="acid-text font-mono">SECURED</span> <span className="mx-2 font-mono">WITH</span>{" "}
            <Skull className="h-4 w-4 mx-1 text-[hsl(var(--toxic-red))] animate-broken-flicker" />{" "}
            <span className="ml-2 font-mono">BY FILESHARE</span>
          </div>
        </div>
      </div>

      {/* Surveillance Footer */}
      <div className="py-2 bg-[rgba(var(--cyber-black-rgb),0.9)] border-t border-[rgba(var(--toxic-red-rgb),0.3)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center mb-2 md:mb-0">
              <Eye className="h-3 w-3 text-[hsl(var(--toxic-red))]" />
              <span className="ml-2 text-xs text-gray-500 font-mono">SYSTEM MONITORING ACTIVE</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 font-mono">IP LOGGED</span>
              <span className="mx-2 text-gray-600">|</span>
              <span className="text-xs text-gray-500 font-mono">ACCESS MONITORED</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
