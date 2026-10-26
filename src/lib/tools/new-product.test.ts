import { describe, expect, it } from 'vitest'
import {
  buildProductDocument,
  slugify,
  textToBlocks,
  validateNewProduct,
  type NewProductInput,
} from './new-product'

const beekeepers = new Set(['bk1'])

const honey: NewProductInput = {
  kind: 'honey',
  shopifyHandle: 'bee-s5',
  name: 'Bee S5',
  tagline: 'Spring blossom from the valley',
  description: 'First paragraph.\n\nSecond paragraph\nwraps.',
  weight: '12oz / 280ml',
  shippingWeightGrams: 613,
  active: true,
  feather: true,
  postcodeCode: 'bs4',
  beekeeperId: 'bk1',
}

const merch: NewProductInput = {
  kind: 'merch',
  shopifyHandle: 'rose-soap',
  name: 'Soap — Rose & Clay',
  tagline: 'Gentle and floral',
  description: 'A bar of soap.',
  weight: '',
  shippingWeightGrams: null,
  active: false,
  feather: true,
  category: 'soap',
}

describe('slugify', () => {
  it('lowercases, hyphenates and handles ampersands and dashes', () => {
    expect(slugify('Soap — Rose & Clay')).toBe('soap-rose-and-clay')
    expect(slugify('  Bee S5!  ')).toBe('bee-s5')
  })
})

describe('textToBlocks', () => {
  it('makes one block per blank-line paragraph and joins wrapped lines', () => {
    const blocks = textToBlocks('First.\n\nSecond\nwraps.\n\n\n')
    expect(blocks).toHaveLength(2)
    expect(blocks[1].children[0].text).toBe('Second wraps.')
    expect(new Set(blocks.map((b) => b._key)).size).toBe(2)
  })
})

describe('validateNewProduct', () => {
  it('accepts valid honey and merch', () => {
    expect(validateNewProduct(honey, beekeepers)).toBeNull()
    expect(validateNewProduct(merch, beekeepers)).toBeNull()
  })

  it.each([
    [{ name: '  ' }, 'Enter a name.'],
    [{ tagline: '' }, 'Enter a tagline.'],
    [{ description: '' }, 'Enter the "where it’s from" story.'],
    [{ weight: '' }, 'Enter the jar size, e.g. "12oz / 280ml".'],
    [{ postcodeCode: 'ZZ' }, 'Enter a real postcode area (e.g. M) or, for Bristol/Bath, a district (e.g. BS4).'],
    [{ postcodeCode: 'BS999' }, 'Enter a real postcode area (e.g. M) or, for Bristol/Bath, a district (e.g. BS4).'],
    [{ beekeeperId: 'made-up' }, 'Choose the beekeeper.'],
    [{ shippingWeightGrams: -5 }, 'Shipping weight must be a positive number of grams.'],
  ])('rejects honey with %j', (override, message) => {
    expect(validateNewProduct({ ...honey, ...override }, beekeepers)).toBe(message)
  })

  it('rejects merch with an unknown or experience category', () => {
    expect(validateNewProduct({ ...merch, category: 'experiences' }, beekeepers)).toBe('Choose a category.')
    expect(validateNewProduct({ ...merch, category: undefined }, beekeepers)).toBe('Choose a category.')
  })
})

describe('buildProductDocument', () => {
  it('builds a honey document with an uppercased postcode and references', () => {
    const doc = buildProductDocument(honey, 'bee-s5', 'image-abc')
    expect(doc).toMatchObject({
      _type: 'honeyProduct',
      name: 'Bee S5',
      slug: { current: 'bee-s5' },
      shopifyHandle: 'bee-s5',
      postcodeCode: 'BS4',
      beekeeper: { _ref: 'bk1' },
      heroImage: { asset: { _ref: 'image-abc' } },
      shippingWeightGrams: 613,
      active: true,
    })
    expect(doc.originStory).toHaveLength(2)
  })

  it('builds a merch document, inactive by default, with no empty size', () => {
    const doc = buildProductDocument(merch, 'soap-rose-and-clay', 'image-abc')
    expect(doc).toMatchObject({ _type: 'merchProduct', category: 'soap', active: false })
    expect(doc.weight).toBeUndefined()
    expect(doc.shippingWeightGrams).toBeUndefined()
  })
})
