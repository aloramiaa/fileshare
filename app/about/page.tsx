import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "About | Secure File Sharing",
  description: "Learn about our secure file transfer protocol system.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 toxic-text dystopian-glitch">SYSTEM OVERVIEW</h1>
        <p className="text-gray-400 mb-8 font-mono">SECURITY PROTOCOL DOCUMENTATION // ACCESS LEVEL: PUBLIC</p>

        <div className="relative dystopian-card p-6 mb-8">
          <div className="dystopian-border-animated absolute inset-0 pointer-events-none"></div>
          <div className="text-gray-300 font-mono space-y-6">
            <p className="acid-text">
              FileShare is an advanced data-transfer protocol designed for secure file transmission across untrusted networks.
              Our system employs military-grade encryption and distributed storage to ensure your data remains protected from surveillance.
            </p>

            <div className="mt-6">
              <h2 className="text-xl font-bold toxic-text mb-3 uppercase dystopian-glitch-sm">CORE DIRECTIVE</h2>
              <div className="pl-4 border-l-2 border-[hsl(var(--acid-green))]">
                <p className="text-sm">
                  Our primary directive is to facilitate secure data exchange while maintaining user anonymity and data integrity.
                  In a world of constant surveillance, we believe in the right to private communication.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold toxic-text mb-3 uppercase dystopian-glitch-sm">SYSTEM CAPABILITIES</h2>
              <ul className="space-y-2 pl-4 border-l-2 border-[hsl(var(--acid-green))]">
                <li className="flex items-start">
                  <span className="text-[hsl(var(--acid-green))] mr-2">■</span>
                  <span>Data streams up to 100MB</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(var(--acid-green))] mr-2">■</span>
                  <span>Instantaneous link generation and distribution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(var(--acid-green))] mr-2">■</span>
                  <span>Zero authentication requirement (anonymous access)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(var(--acid-green))] mr-2">■</span>
                  <span>Quantum-resistant encryption protocols</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(var(--acid-green))] mr-2">■</span>
                  <span>Universal data format compatibility</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(var(--acid-green))] mr-2">■</span>
                  <span>Integrated visualization for common data types</span>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold toxic-text mb-3 uppercase dystopian-glitch-sm">TECHNICAL SPECIFICATIONS</h2>
              <div className="bg-black/30 p-3 font-mono text-xs overflow-hidden relative dystopian-border">
                <p className="mb-2 text-[hsl(var(--toxic-red))]">// SYSTEM ARCHITECTURE</p>
                <p className="opacity-70 mb-1">&#62; Frontend: React + Next.js framework</p>
                <p className="opacity-70 mb-1">&#62; Backend: Serverless architecture</p>
                <p className="opacity-70 mb-1">&#62; Storage: Distributed secure data nodes</p>
                <p className="opacity-70 mb-1">&#62; Encryption: AES-256 + custom protocols</p>
                <p className="opacity-70">&#62; Networking: TCP/IP with obfuscation layer</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button asChild className="dystopian-button">
            <Link href="/upload">
              INITIATE DATA TRANSFER
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
