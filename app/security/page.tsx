"use client"

import { Shield, Lock, EyeOff, FileWarning, Zap, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 toxic-text dystopian-glitch">SECURITY PROTOCOL</h1>
        
        <div className="dystopian-card mb-8 p-6">
          <h2 className="text-2xl font-bold mb-4 acid-text">DATA PROTECTION MATRIX</h2>
          <p className="dystopian-text mb-6">
            All uploaded content is securely processed through our advanced encryption systems. 
            Files are transformed via proprietary algorithms designed to maximize data integrity 
            while minimizing vulnerability vectors.
          </p>
          
          <div className="border-l-4 border-toxic-red pl-4 py-2 mb-6 dystopian-border">
            <h3 className="text-lg font-mono font-bold">SYSTEM.LOG: ENCRYPTION PROTOCOL</h3>
            <p className="font-mono text-sm opacity-80">
              {'>'} AES-256 bit encryption employed for all secure files<br />
              {'>'} Password protection available for sensitive data packages<br />
              {'>'} Decryption keys required for maximum security clearance<br />
              {'>'} All transmission secured via TLS 1.3 protocol
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-black/20 dystopian-border">
              <h3 className="text-lg font-bold mb-2 toxic-text">USER SURVEILLANCE</h3>
              <p className="text-sm opacity-80">
                Your IP address and system configuration are logged with each file interaction. 
                This data is used for security enforcement and compliance monitoring. Activity 
                patterns are analyzed for threat detection and prevention protocols.
              </p>
            </div>
            <div className="p-4 bg-black/20 dystopian-border">
              <h3 className="text-lg font-bold mb-2 toxic-text">DATA RETENTION</h3>
              <p className="text-sm opacity-80">
                Files are stored only for the duration specified by our system parameters.
                All content is subject to automatic deletion after activation of retention
                protocols. Deleted files cannot be recovered after purge completion.
              </p>
            </div>
          </div>
        </div>
        
        <div className="dystopian-card mb-8 p-6">
          <h2 className="text-2xl font-bold mb-4 acid-text">ACCESS CONTROL FRAMEWORK</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="w-12 h-12 flex items-center justify-center mr-4 dystopian-border">
                <span className="text-2xl toxic-text">01</span>
              </div>
              <div>
                <h3 className="text-lg font-bold acid-text">AUTHORIZED ACCESS</h3>
                <p className="opacity-80">
                  File access is restricted to authorized users with valid authentication credentials.
                  Password-protected files require exact passphrase input before content delivery.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 flex items-center justify-center mr-4 dystopian-border">
                <span className="text-2xl toxic-text">02</span>
              </div>
              <div>
                <h3 className="text-lg font-bold acid-text">VIOLATION PROTOCOLS</h3>
                <p className="opacity-80">
                  Unauthorized access attempts are logged and monitored. Multiple failed
                  authentication attempts may result in temporary or permanent IP restriction.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 flex items-center justify-center mr-4 dystopian-border">
                <span className="text-2xl toxic-text">03</span>
              </div>
              <div>
                <h3 className="text-lg font-bold acid-text">CONTENT MONITORING</h3>
                <p className="opacity-80">
                  All uploaded content is scanned for malicious code, prohibited material,
                  and regulatory compliance. Files that violate our terms are subject to
                  immediate deletion and account suspension.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-black/30 dystopian-border font-mono text-sm">
            <div className="flex justify-between mb-2">
              <span className="toxic-text">SYSTEM UPTIME</span>
              <span>99.97%</span>
            </div>
            <div className="w-full bg-gray-800 h-2 mb-4">
              <div className="bg-toxic-green h-full" style={{ width: "99.97%" }}></div>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="toxic-text">THREAT DETECTION</span>
              <span>ACTIVE</span>
            </div>
            <div className="w-full bg-gray-800 h-2 mb-4">
              <div className="bg-toxic-red h-full" style={{ width: "100%" }}></div>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="toxic-text">SECURITY PROTOCOL</span>
              <span>DEFCON 2</span>
            </div>
            <div className="w-full bg-gray-800 h-2">
              <div className="bg-yellow-500 h-full" style={{ width: "75%" }}></div>
            </div>
          </div>
        </div>
        
        <div className="dystopian-card p-6">
          <h2 className="text-2xl font-bold mb-4 acid-text">COMPLIANCE DIRECTIVES</h2>
          <p className="dystopian-text mb-6">
            By utilizing our system, you acknowledge and consent to all security protocols,
            monitoring practices, and data retention policies. Non-compliance with system
            directives may result in termination of service access.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Link href="/terms" className="dystopian-button flex-1 text-center py-3">
              TERMS OF SERVICE
            </Link>
            <Link href="/privacy" className="dystopian-button flex-1 text-center py-3">
              PRIVACY DIRECTIVE
            </Link>
            <Link href="/" className="dystopian-button flex-1 text-center py-3">
              RETURN TO MAINFRAME
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 