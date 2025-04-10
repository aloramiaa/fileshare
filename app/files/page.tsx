import { FileGrid } from "@/components/file-grid"

export const metadata = {
  title: "Your Files | Secure File Sharing",
  description: "Access your uploaded files securely.",
}

export default function FilesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 toxic-text dystopian-glitch">YOUR UPLOADS</h1>
        <p className="text-gray-400 mb-8 font-mono">
          ONLY FILES UPLOADED FROM YOUR CURRENT IP ADDRESS ARE VISIBLE
        </p>
        
        <div className="relative dystopian-card p-6 mb-8">
          <div className="dystopian-border-animated absolute inset-0 pointer-events-none"></div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--toxic-red))] warning-blink"></div>
            <h2 className="text-xl font-bold toxic-text font-mono">SECURITY NOTICE</h2>
          </div>
          <p className="text-gray-400 font-mono text-sm mb-4">
            FOR YOUR SECURITY, THIS TERMINAL DISPLAYS ONLY FILES UPLOADED FROM YOUR CURRENT IP ADDRESS. 
            FILES UPLOADED FROM OTHER LOCATIONS ARE NOT ACCESSIBLE FROM THIS INTERFACE. 
            THIS MEASURE PREVENTS UNAUTHORIZED ACCESS TO YOUR DATA.
          </p>
          <div className="text-xs font-mono bg-black/30 p-3 dystopian-border">
            <p className="toxic-text">SYSTEM LOG:</p>
            <p className="opacity-70">&#62; IP-based access control active</p>
            <p className="opacity-70">&#62; File surveillance protocol initialized</p>
            <p className="opacity-70">&#62; User activity being monitored</p>
          </div>
        </div>
        
        <FileGrid showMeta={true} showUploadButton={true} />
      </div>
    </div>
  )
}
