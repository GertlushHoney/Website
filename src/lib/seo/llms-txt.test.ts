import { describe, expect, it } from 'vitest'
import { buildLlmsTxt } from './llms-txt'

const base = { siteUrl: 'https://www.gertlushhoney.co.uk', freeDeliveryThresholdGbp: 50 }

describe('buildLlmsTxt', () => {
  it('lists each honey with its postcode, area and beekeeper, linked by absolute URL', () => {
    const text = buildLlmsTxt({
      ...base,
      honeys: [
        {
          name: 'Bee S3',
          slug: 'bee-s3',
          tagline: ' Pure honey from the Northern Slopes. ',
          postcodeCode: 'BS3',
          areaName: 'Bristol',
          beekeeperName: 'Adam Evans',
        },
      ],
    })
    expect(text).toContain(
      '- [Bee S3](https://www.gertlushhoney.co.uk/shop/bee-s3): Pure honey from the Northern Slopes. Postcode BS3 (Bristol), by beekeeper Adam Evans.'
    )
    expect(text.startsWith('# Gert Lush Honey\n')).toBe(true)
  })

  it('adds a full stop to a tagline that lacks one', () => {
    const text = buildLlmsTxt({
      ...base,
      honeys: [
        { name: 'X', slug: 'x', tagline: 'Pure Honey from Brislington', postcodeCode: 'BS4', areaName: 'Bristol', beekeeperName: null },
      ],
    })
    expect(text).toContain('Pure Honey from Brislington. Postcode BS4 (Bristol).')
  })

  it('copes with a honey missing an area name or beekeeper', () => {
    const text = buildLlmsTxt({
      ...base,
      honeys: [
        { name: 'X', slug: 'x', tagline: 'T.', postcodeCode: 'M', areaName: null, beekeeperName: null },
      ],
    })
    expect(text).toContain('Postcode M.')
    expect(text).not.toContain('by beekeeper')
  })

  it('says so plainly when no honey is listed, rather than inventing any', () => {
    expect(buildLlmsTxt({ ...base, honeys: [] })).toContain('No honey is listed at the moment.')
  })

  it('includes the delivery facts from the real threshold and links the key pages', () => {
    const text = buildLlmsTxt({ ...base, honeys: [] })
    expect(text).toContain('free over £50')
    expect(text).toContain('(https://www.gertlushhoney.co.uk/fake-honey)')
    expect(text).toContain('(https://www.gertlushhoney.co.uk/postcode-honey)')
  })

  it('makes no claim about the Gert Lush Standard or certification', () => {
    const text = buildLlmsTxt({ ...base, honeys: [] }).toLowerCase()
    expect(text).not.toContain('standard')
    expect(text).not.toContain('certif')
  })
})
