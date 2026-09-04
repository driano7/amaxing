// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
'use client'

import { useEffect } from 'react'

export default function SiteCookie() {
  useEffect(() => {
    try {
      // Site-wide visited cookie for faster return (30 days)
      const hasVisited = document.cookie.includes('amaxing_visited=')
      if (!hasVisited) {
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
        document.cookie = `amaxing_visited=1; expires=${expires}; path=/; SameSite=Lax`
      }
      // Cache flag in localStorage for instant shell
      const cacheKey = 'amaxing_cache_v1'
      if (!localStorage.getItem(cacheKey)) {
        localStorage.setItem(cacheKey, String(Date.now()))
      }
      // Prefetch critical images for guides/local (local static now)
      const critical = [
        '/static/images/guides/condesa.jpg',
        '/static/images/guides/centro.jpg',
        '/static/images/guides/chapultepec.jpg',
        '/static/images/local-picks/mercado-san-juan.jpg',
      ]
      critical.forEach((src) => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'image'
        link.href = src
        document.head.appendChild(link)
      })
    } catch (e) {
      void e
    }
  }, [])

  return null
}
