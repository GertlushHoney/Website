import { defineField, defineType } from 'sanity'

// For non-honey shop items (candles, soap, hampers, lip balm) — standalone
// products with no postcode/beekeeper link, unlike `honeyProduct`. Each
// product gets its own real slug/page at /shop/[slug] (same route
// honeyProduct uses); /shop/{candles,hamper,soap,lip-balm} are category
// LISTING pages showing every active product in that category — never
// gate a category page on a product's own slug, since a product's slug is
// its own identity (e.g. "beeswax-candle-skep-and-bees"), not the category.
export const merchProduct = defineType({
  name: 'merchProduct',
  title: 'Merch Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'e.g. "Beeswax Candle — Skep and Bees"',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: "This product's own page: /shop/[slug]. Fine to auto-generate from the name.",
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Which shop category page this appears on.',
      type: 'string',
      options: {
        list: [
          { title: 'Candles', value: 'candles' },
          { title: 'Gift Hampers', value: 'hamper' },
          { title: 'Soap', value: 'soap' },
          { title: 'Lip Balm', value: 'lip-balm' },
          { title: 'Experiences', value: 'experiences' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shopifyHandle',
      title: 'Shopify product handle',
      description: 'The exact handle from the Shopify product URL — never the product title.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Product image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'weight',
      title: 'Size / weight',
      description:
        'e.g. "50g", "8cm x 5cm", or "Approx. 200g". Optional — leave blank for products (like Experiences) where it doesn\'t apply.',
      type: 'string',
    }),
    defineField({
      name: 'deliveryPrice',
      title: 'Delivery price (£)',
      type: 'number',
      initialValue: 4.99,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      description: 'Turn on once this is a real, ready-to-sell product.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'category', media: 'heroImage' },
  },
})
