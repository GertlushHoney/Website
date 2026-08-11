'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const SESSION_KEY = 'gert-lush-splash-seen'
const AUTO_DISMISS_MS = 1800
const FADE_MS = 500

export function Splash() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadySeen = sessionStorage.getItem(SESSION_KEY)

    if (alreadySeen || reducedMotion) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }

    // sessionStorage/matchMedia only exist client-side, so this mount check
    // has to run in an effect rather than a lazy useState initializer (which
    // would throw during server render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true)
    const dismissTimer = setTimeout(() => setFading(true), AUTO_DISMISS_MS)
    const removeTimer = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem(SESSION_KEY, '1')
    }, AUTO_DISMISS_MS + FADE_MS)

    return () => {
      clearTimeout(dismissTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  function dismissNow() {
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem(SESSION_KEY, '1')
    }, FADE_MS)
  }

  if (!visible) return null

  return (
    <div
      id="splash"
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
      onClick={dismissNow}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') dismissNow()
      }}
      className={`fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black transition-opacity ease-out ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <noscript>
        <style>{'#splash{display:none}'}</style>
      </noscript>

      {/* Real honey-straining photo (2026-08-10), kept deliberately faint —
          texture and mood only, never competing with the logo. */}
      <Image
        src="/images/source/honey-strain-dark.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-black/25" />

      {/* wordmark-transparent.png, not emblem-gold-on-black.png — the latter
          has an opaque black backing that would show as a hard-edged box
          now that the backdrop isn't flat black. */}
      <div className="relative h-44 w-72 sm:h-64 sm:w-[26rem]">
        <Image
          src="/images/brand/wordmark-transparent.png"
          alt="Gert Lush Honey"
          fill
          priority
          sizes="416px"
          className="object-contain"
        />
      </div>
    </div>
  )
}
