'use client'

import { useEffect } from 'react'

// Blocks the right-click context menu site-wide, per explicit request to
// deter casual image saving. Worth knowing: this doesn't meaningfully
// prevent copying (dev tools, view-source, and screenshots all still work)
// and it also blocks legitimate uses of right-click (e.g. "open link in new
// tab"). See /docs/brand-alignment-board.md if a real deterrent (visible
// watermark) is wanted later.
export function DisableContextMenu() {
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  return null
}
