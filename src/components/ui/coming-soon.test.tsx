import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComingSoon } from './coming-soon'

describe('ComingSoon', () => {
  it('renders the supplied title as the page heading', () => {
    render(<ComingSoon title="Shop" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Shop' })).toBeInTheDocument()
  })
})
