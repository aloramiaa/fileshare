import FileUploader from "@/components/file-uploader"
import { AlertTriangle } from "lucide-react"

export const metadata = {
  title: "Upload Files | Secure File Sharing",
  description: "Upload your files securely with optional password protection and encryption.",
}

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 toxic-text dystopian-glitch">DATA TRANSFER PROTOCOL</h1>
        <p className="text-gray-400 mb-8 font-mono">SECURE FILE TRANSMISSION INTERFACE // MAX CAPACITY: 100MB</p>
        
        <div className="relative dystopian-card p-6 mb-8">
          <div className="dystopian-border-animated absolute inset-0 pointer-events-none"></div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--acid-green))] warning-blink"></div>
              <h2 className="text-xl font-bold acid-text font-mono">UPLOAD TERMINAL</h2>
            </div>
            <p className="text-gray-400 font-mono text-sm mb-4">
              THIS INTERFACE ALLOWS SECURE TRANSMISSION OF DATA PACKETS TO CENTRAL STORAGE.
              UPLOADED FILES ARE ENCRYPTED AND ACCESSIBLE VIA SECURE LINK GENERATION.
            </p>
          </div>
          
          <FileUploader />
        </div>
        
        <div className="dystopian-card p-4 border border-[rgba(var(--toxic-red-rgb),0.3)]">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--toxic-red))] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold toxic-text mb-1 font-mono text-sm">SECURITY NOTICE</h3>
              <p className="text-xs text-gray-400 font-mono">
                ALL UPLOADS ARE MONITORED AND LOGGED. USER IP AND SYSTEM INFORMATION IS RECORDED 
                WITH EACH TRANSMISSION. PROHIBITED CONTENT WILL BE REPORTED TO AUTHORITIES.
                BY USING THIS SYSTEM, YOU CONSENT TO ALL MONITORING PROTOCOLS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
