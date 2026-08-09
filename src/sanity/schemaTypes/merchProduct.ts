import { defineField, defineType } from 'sanity'

// For non-honey shop items (candles, soap, hampers, lip balm) — standalone
// products with no postcode/beekeeper link, unlike `honeyProduct`. Each of
// /shop/{candles,hamper,soap,lip-balm} checks for a matching, active
// document here by a fixed slug; if none exists yet, the page falls back to
// the honest "coming soon" content (ComingSoonProduct) instead of breaking.
export const merchProduct = defineType({
  name: 'merchProduct',
  title: 'Merch Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'e.g. "Beeswax Candle — Small"',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'Must exactly match one of the existing category pages: candles, hamper, soap, or lip-balm.',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category label',
      description: 'e.g. "Candles" — shown as the page eyebrow.',
      type: 'string',
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
