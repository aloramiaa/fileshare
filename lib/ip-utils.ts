import { NextRequest } from "next/server";

/**
 * Gets the user's public IP address using multiple methods
 * First tries standard headers, then falls back to external IP lookup services
 */
export async function getPublicIp(request: NextRequest): Promise<string> {
  try {
    // Try to get IP from headers first
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    // If we have a valid IP in headers, use it
    let requestIp = forwardedFor?.split(',')[0] || realIp || cfConnectingIp;
    
    // If we're in local development or couldn't get an IP from headers
    if (!requestIp || requestIp === '127.0.0.1' || requestIp === 'localhost' || requestIp === '::1') {
      // Try ipify API to get public IP
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          requestIp = ipData.ip;
          console.log("IP detected from external service");
        } 
      } catch (e) {
        console.warn("IP detection service failed");
      }
      
      // If ipify fails, try backup service
      if (!requestIp || requestIp === '127.0.0.1' || requestIp === 'localhost' || requestIp === '::1') {
        try {
          const backupResponse = await fetch('https://ipinfo.io/json');
          if (backupResponse.ok) {
            const backupData = await backupResponse.json();
            requestIp = backupData.ip;
            console.log("IP detected from backup service");
          }
        } catch (e) {
          console.warn("Backup IP service failed");
        }
      }
    }
    
    // If all methods fail, use 'local-development' as fallback
    return requestIp || 'local-development';
  } catch (error) {
    console.error("Error getting public IP");
    return 'local-development';
  }
} 