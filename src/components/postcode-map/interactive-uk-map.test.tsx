import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))
vi.mock('@/lib/email/waiting-list', () => ({ joinPostcodeWaitingList: vi.fn() }))

import { InteractiveUkMap, type ActiveMapProduct } from './interactive-uk-map'

afterEach(cleanup)

const bee3: ActiveMapProduct = {
  slug: 'bee-s3',
  name: 'Bee S3',
  tagline: 'Pure honey from the Northern Slopes.',
  imageUrl: 'https://cdn.example/bee-s3.png',
}
const creamed: ActiveMapProduct = {
  slug: 'bee-s3-creamed',
  name: 'Bee S3 Creamed',
  tagline: 'Pure creamed honey from the Northern Slopes.',
  imageUrl: 'https://cdn.example/bee-s3-creamed.png',
}

// Bristol is a drill-down area: pick BS in the dropdown, then a district.
function openDistrict(activeProducts: Record<string, ActiveMapProduct[]>, district: string) {
  render(<InteractiveUkMap svgMarkup="<svg></svg>" activeProducts={activeProducts} />)
  fireEvent.change(screen.getByLabelText('Or find your postcode area'), { target: { value: 'BS' } })
  fireEvent.click(screen.getByRole('button', { name: district }))
}

describe('InteractiveUkMap with several honeys in one postcode', () => {
  it('lists every honey from the postcode, each with its own link', () => {
    openDistrict({ BS3: [bee3, creamed] }, 'BS3')

    expect(screen.getByRole('link', { name: 'View Bee S3' }).getAttribute('href')).toBe('/shop/bee-s3')
    expect(screen.getByRole('link', { name: 'View Bee S3 Creamed' }).getAttribute('href')).toBe(
      '/shop/bee-s3-creamed'
    )
    expect(screen.getByAltText('A jar of Bee S3 honey')).toBeTruthy()
    expect(screen.getByAltText('A jar of Bee S3 Creamed honey')).toBeTruthy()
  })

  it('still shows the single-honey layout when a postcode has just one', () => {
    openDistrict({ BS3: [bee3] }, 'BS3')

    expect(screen.getByRole('link', { name: 'View Bee S3' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'View Bee S3 Creamed' })).toBeNull()
  })

  it('shows the waiting-list prompt for a postcode with no honey', () => {
    openDistrict({ BS3: [bee3, creamed] }, 'BS4')

    expect(screen.getByText('No honey from BS4 yet.')).toBeTruthy()
  })
})
