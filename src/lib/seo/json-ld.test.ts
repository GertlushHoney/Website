import { describe, expect, it } from 'vitest'
import { beekeeperJsonLd, productJsonLd } from './json-ld'

const base = {
  name: 'Bee S3',
  description: 'Pure honey',
  imageUrl: null,
  slug: 'bee-s3',
  price: 9.5,
}

const review = (rating: number, name = 'Alex') => ({
  reviewerName: name,
  rating,
  body: 'Lovely honey, would buy again.',
  submittedAt: '2026-10-20T09:30:00.000Z',
})

describe('productJsonLd reviews', () => {
  it('adds no rating at all when there are no approved reviews', () => {
    const data = productJsonLd(base)
    expect(data).not.toHaveProperty('aggregateRating')
    expect(data).not.toHaveProperty('review')
  })

  it('adds a rounded aggregate and the reviews when there are some', () => {
    const data = productJsonLd({ ...base, reviews: [review(5), review(4), review(4)] }) as Record<string, unknown>
    expect(data.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: '4.3',
      reviewCount: 3,
      bestRating: 5,
      worstRating: 1,
    })
    const reviews = data.review as { author: { name: string }; datePublished: string }[]
    expect(reviews).toHaveLength(3)
    expect(reviews[0].datePublished).toBe('2026-10-20')
    expect(reviews[0].author.name).toBe('Alex')
  })

  it('counts every review in the aggregate but lists at most five', () => {
    const many = Array.from({ length: 8 }, () => review(5))
    const data = productJsonLd({ ...base, reviews: many }) as Record<string, unknown>
    expect((data.aggregateRating as { reviewCount: number }).reviewCount).toBe(8)
    expect(data.review).toHaveLength(5)
  })

  it('still omits the offer when there is no real price', () => {
    expect(productJsonLd({ ...base, price: null })).not.toHaveProperty('offers')
  })
})

describe('beekeeperJsonLd', () => {
  it('describes the beekeeper as a Person with their page URL and place', () => {
    const data = beekeeperJsonLd({
      name: 'Adam Evans',
      slug: 'adam',
      description: ' Keeps bees on the Northern Slopes. ',
      area: 'Bristol',
      imageUrl: 'https://cdn.example/adam.jpg',
    })
    expect(data).toMatchObject({
      '@type': 'Person',
      name: 'Adam Evans',
      url: expect.stringContaining('/beekeepers/adam'),
      jobTitle: 'Beekeeper',
      description: 'Keeps bees on the Northern Slopes.',
      image: 'https://cdn.example/adam.jpg',
      workLocation: { '@type': 'Place', name: 'Bristol' },
    })
  })

  it('leaves out the image when there is none', () => {
    const data = beekeeperJsonLd({ name: 'A', slug: 'a', description: 'd', area: 'x', imageUrl: null })
    expect(data).not.toHaveProperty('image')
  })
})
