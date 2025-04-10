/**
 * Generates a file URL using the application's domain instead of direct Supabase URLs
 */
export function getFileUrl(fileId: string): string {
  // In production, this will use the deployed domain
  // In development, it will use localhost
  return `/api/files/${fileId}`
}

/**
 * Extracts the file ID from a Supabase URL or file path
 */
export function getFileIdFromPath(path: string): string {
  // Handle full Supabase URLs
  if (path.includes("supabase.co/storage/v1/object/public/files/uploads/")) {
    return path.split("uploads/").pop() || path
  }

  // Handle relative paths
  if (path.startsWith("uploads/")) {
    return path.replace("uploads/", "")
  }

  return path
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}

/**
 * Formats date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
