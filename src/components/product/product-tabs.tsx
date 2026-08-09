'use client'

import { useState, type ReactNode } from 'react'

type Tab = {
  id: string
  label: string
  content: ReactNode
}

export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0].id)

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product information"
        className="border-ink-line flex gap-1 border-b"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId
          return (
            <button
              key={tab.id}
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
          className="py-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
