import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProductGallery } from './product-gallery'

// No `globals: true` in this project's vitest config — see
// purchase-options.test.tsx for why cleanup has to be registered by hand.
afterEach(cleanup)

const slide = (n: number) => ({
  key: `photo-${n}`,
  src: `https://cdn.sanity.io/images/test/production/photo-${n}-100x100.jpg`,
  thumbSrc: `https://cdn.sanity.io/images/test/production/photo-${n}-100x100.jpg?w=160`,
  alt: `Photo ${n}`,
})

function renderGallery(count: number) {
  return render(
    <ProductGallery
      slides={Array.from({ length: count }, (_, i) => slide(i + 1))}
      productName="Bee plate"
      imageClassName="object-contain"
    />
  )
}

const counter = () => screen.getByText(/^\d+ \/ \d+$/).textContent

describe('ProductGallery', () => {
  it('shows a single photo with no carousel controls', () => {
    renderGallery(1)
    expect(screen.getByAltText('Photo 1')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Next photo' })).toBeNull()
    expect(screen.queryByRole('group', { name: 'Choose a photo' })).toBeNull()
  })

  it('moves between photos with the arrows, wrapping at either end', () => {
    renderGallery(3)
    expect(counter()).toBe('1 / 3')
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(counter()).toBe('2 / 3')
    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(counter()).toBe('3 / 3')
  })

  it('jumps straight to a photo from its thumbnail and marks it current', () => {
    renderGallery(3)
    const third = screen.getByRole('button', { name: 'Show photo 3: Photo 3' })
    fireEvent.click(third)
    expect(counter()).toBe('3 / 3')
    expect(third.getAttribute('aria-current')).toBe('true')
  })

  it('supports left/right arrow keys and swiping', () => {
    const { container } = renderGallery(2)
    const region = screen.getByRole('region', { name: 'Bee plate photos' })
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(counter()).toBe('2 / 2')

    const stage = container.querySelector('.min-h-\\[420px\\]')!
    fireEvent.touchStart(stage, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 200 }] })
    expect(counter()).toBe('1 / 2')
  })
})
