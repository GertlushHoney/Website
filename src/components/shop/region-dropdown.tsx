'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

export type RegionOption = { value: string; label: string; count: number }

// A branded replacement for the browser's own <select> list, which can't be
// styled (it showed up as a plain blue-highlight box on the dark page). Built
// as the standard "select-only combobox": the button keeps focus the whole
// time and points at the highlighted option with aria-activedescendant, so
// screen readers and the keyboard behave like a normal dropdown —
// ArrowUp/Down, Home/End, Enter or Space to choose, Escape to close, Tab to
// move on. Clicking or tapping outside closes it.
export function RegionDropdown({
  value,
  options,
  onChange,
  label = 'Region',
  ariaLabel,
}: {
  value: string
  options: RegionOption[]
  onChange: (value: string) => void
  label?: string
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const [active, setActive] = useState(selectedIndex)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const optionId = (index: number) => `${listId}-option-${index}`
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the highlighted option visible when the list is long enough to scroll.
  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' })
    // optionId is derived from listId, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active])

  function openList() {
    setActive(selectedIndex)
    setOpen(true)
  }

  function choose(index: number) {
    onChange(options[index].value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openList()
        else setActive((i) => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openList()
        else setActive((i) => Math.max(i - 1, 0))
        break
      case 'Home':
        if (open) {
          event.preventDefault()
          setActive(0)
        }
        break
      case 'End':
        if (open) {
          event.preventDefault()
          setActive(options.length - 1)
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!open) openList()
        else choose(active)
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber flex items-center gap-2 rounded-full border py-2.5 pr-4 pl-6 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-4"
      >
        <span className="text-porcelain/60 font-normal">{label}</span>
        <span>
          {selected.label} ({selected.count})
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`text-honey-amber h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="border-honey-amber/30 bg-ink-surface absolute top-full left-0 z-30 mt-2 max-h-72 w-max max-w-[calc(100vw-3rem)] min-w-full overflow-auto rounded-2xl border py-2 shadow-2xl shadow-black/60"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex
            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                // mousedown would blur the button before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                onMouseMove={() => setActive(index)}
                className={`flex cursor-pointer items-center gap-3 px-5 py-2.5 text-sm ${
                  index === active ? 'bg-honey-amber/15 text-porcelain' : 'text-porcelain/85'
                } ${isSelected ? 'font-semibold' : ''}`}
              >
                <span className="text-honey-amber w-4 shrink-0" aria-hidden="true">
                  {isSelected ? '✓' : ''}
                </span>
                <span className="flex-1">{option.label}</span>
                <span className="text-porcelain/50 font-normal tabular-nums">{option.count}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
