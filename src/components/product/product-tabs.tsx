'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

type Tab = {
  id: string
  label: string
  content: ReactNode
}

// Desktop/tablet keeps a real tab interface; mobile gets accordions instead
// of the same tab row squeezed onto a narrow screen. A CSS breakpoint swap
// (both structures render, only one is ever visually + accessibility-tree
// present, since the other has `display: none`) rather than a JS viewport
// check, matching the pattern already used for the header/nav split. See
// "FIX PRODUCT INFORMATION TABS" audit, 2026-09-13 — the previous version
// had a fixed-width tab row that overflowed below ~640px, and inactive
// tabs sat at tabIndex=-1 with no arrow-key handling to ever reach them
// from the keyboard.
export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0].id)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const activeIndex = tabs.findIndex((tab) => tab.id === activeId)

  function activateByIndex(index: number) {
    const wrapped = (index + tabs.length) % tabs.length
    const tab = tabs[wrapped]
    setActiveId(tab.id)
    tabRefs.current[tab.id]?.focus()
  }

  // Full WAI-ARIA APG "Tabs" keyboard pattern, automatic activation: arrow
  // keys move focus AND select the tab (matching the existing click-to-
  // activate immediacy), wrapping at either end; Home/End jump straight to
  // the first/last tab. This is what makes the roving tabindex below
  // actually reachable — without it, inactive tabs (tabIndex=-1) could
  // never be focused at all once a screen reader or keyboard user tabbed
  // past the tablist.
  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        activateByIndex(activeIndex + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        activateByIndex(activeIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        activateByIndex(0)
        break
      case 'End':
        event.preventDefault()
        activateByIndex(tabs.length - 1)
        break
    }
  }

  return (
    <div>
      <div className="hidden sm:block">
        <div
          role="tablist"
          aria-label="Product information"
          className="border-ink-line flex flex-wrap gap-1 border-b"
          onKeyDown={handleTabListKeyDown}
        >
          {tabs.map((tab) => {
            const active = tab.id === activeId
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el
                }}
                role="tab"
                type="button"
                id={`tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveId(tab.id)}
                className={`focus-visible:outline-honey-amber -mb-px border-b-2 px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2 ${
                  active
                    ? 'border-honey-amber text-porcelain'
                    : 'text-porcelain/50 hover:text-porcelain/80 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={tab.id !== activeId}
            // Lets keyboard/screen-reader users jump straight into the
            // panel's content after selecting a tab, per the WAI-ARIA APG
            // tabs pattern, regardless of whether the content itself
            // happens to contain a focusable element.
            tabIndex={0}
            className="focus-visible:outline-honey-amber py-8 focus-visible:outline focus-visible:outline-offset-2"
          >
            {tab.content}
          </div>
        ))}
      </div>

      {/* Mobile: accordions using the same native <details>/<summary>
          pattern as the FAQ page — each section stacks in normal flow with
          nothing to overflow, and expand/collapse semantics come free from
          the browser. `name` groups them into one native exclusive-open
          set (one section open at a time, no JS required) in browsers that
          support it; elsewhere they simply behave as independent, still
          fully keyboard- and screen-reader-accessible disclosures. */}
      <div className="border-ink-line divide-ink-line divide-y border-y sm:hidden">
        {tabs.map((tab, index) => (
          <details key={tab.id} name="product-info" open={index === 0} className="group py-1">
            <summary className="text-porcelain marker:content-none flex cursor-pointer list-none items-center justify-between gap-4 px-1 py-3 text-sm font-semibold">
              {tab.label}
              <span
                aria-hidden="true"
                className="text-porcelain/50 shrink-0 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="px-1 pt-1 pb-4">{tab.content}</div>
          </details>
        ))}
      </div>
    </div>
  )
}
