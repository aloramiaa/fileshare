"use client"

import { useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"

export function MetaUpdater() {
  const { settings, loading } = useSettings()
  const { siteName, siteDescription } = settings.display

  useEffect(() => {
    if (loading) return

    // Update document title
    document.title = siteName

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute("content", siteDescription)
    }

    // Update Open Graph meta tags
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement("meta")
      ogTitle.setAttribute("property", "og:title")
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute("content", siteName)

    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement("meta")
      ogDescription.setAttribute("property", "og:description")
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute("content", siteDescription)

    // Update Twitter meta tags
    let twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (!twitterTitle) {
      twitterTitle = document.createElement("meta")
      twitterTitle.setAttribute("name", "twitter:title")
      document.head.appendChild(twitterTitle)
    }
    twitterTitle.setAttribute("content", siteName)

    let twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (!twitterDescription) {
      twitterDescription = document.createElement("meta")
      twitterDescription.setAttribute("name", "twitter:description")
      document.head.appendChild(twitterDescription)
    }
    twitterDescription.setAttribute("content", siteDescription)
  }, [loading, siteName, siteDescription])

  return null
}
