import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { RegionDropdown, type RegionOption } from './region-dropdown'

afterEach(cleanup)

const options: RegionOption[] = [
  { value: 'all', label: 'All regions', count: 4 },
  { value: 'South East', label: 'South East', count: 2 },
  { value: 'South West', label: 'South West', count: 2 },
]

function Harness() {
  const [value, setValue] = useState('all')
  return (
    <>
      <RegionDropdown value={value} onChange={setValue} options={options} ariaLabel="Filter honey by UK region" />
      <p data-testid="chosen">{value}</p>
    </>
  )
}

const button = () => screen.getByRole('combobox', { name: 'Filter honey by UK region' })

describe('RegionDropdown', () => {
  it('shows the current choice with its count and keeps the list closed', () => {
    render(<Harness />)
    expect(button()).toHaveTextContent('Region')
    expect(button()).toHaveTextContent('All regions (4)')
    expect(button()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('opens on click, lists every region with a count, and picks one on click', () => {
    render(<Harness />)
    fireEvent.click(button())
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByRole('option', { name: /South West/ })).toHaveTextContent('2')
    fireEvent.click(screen.getByRole('option', { name: /South East/ }))
    expect(screen.getByTestId('chosen')).toHaveTextContent('South East')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(button()).toHaveTextContent('South East (2)')
  })

  it('works from the keyboard: arrows move, Enter chooses, Escape closes', () => {
    render(<Harness />)
    fireEvent.keyDown(button(), { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(button(), { key: 'ArrowDown' })
    fireEvent.keyDown(button(), { key: 'ArrowDown' })
    expect(button().getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[2].id)
    fireEvent.keyDown(button(), { key: 'Enter' })
    expect(screen.getByTestId('chosen')).toHaveTextContent('South West')

    fireEvent.keyDown(button(), { key: ' ' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(button(), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByTestId('chosen')).toHaveTextContent('South West')
  })

  it('closes when you press outside it', () => {
    render(<Harness />)
    fireEvent.click(button())
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
