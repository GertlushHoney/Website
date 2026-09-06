import { defineField, defineType } from 'sanity'

// The generic postcode-honey product template. Adding a new real product
// should only ever require: this document (map link + beekeeper link +
// story/photo) plus the matching product in Shopify (price/stock/checkout).
// See /shop/[slug]/page.tsx (renders this) and
// /components/postcode-map/interactive-uk-map.tsx (reads postcodeCode).
export const honeyProduct = defineType({
  name: 'honeyProduct',
  title: 'Honey Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'e.g. "Bee S3"',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Drives the product page URL: /shop/[slug]',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'e.g. "Pure honey from the Northern Slopes."',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shopifyHandle',
      title: 'Shopify product handle',
      description:
        'The exact handle from the Shopify product URL (Shopify admin → Products → the product → check the URL/SEO section). Never the product title — the handle.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'postcodeCode',
      title: 'Postcode code',
      description:
        'The exact code that lights this product up on the postcode map — either a UK postcode AREA (e.g. "M") or, for Bristol/Bath, a DISTRICT (e.g. "BS3").',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'beekeeper',
      title: 'Beekeeper',
      type: 'reference',
      to: [{ type: 'beekeeper' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero / jar image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'weight',
      title: 'Weight / size',
      description: 'e.g. "12oz / 280ml"',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shippingWeightGrams',
      title: 'Shipping weight (g)',
      description:
        'The real packaged weight — jar, honey and any padding — in grams. Used to push a real weight to Shopify so its weight-based delivery rates have something accurate to calculate against. Separate from "Weight / size" above, which is just what shoppers read on the page.',
      type: 'number',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'originStory',
      title: 'Origin story',
      description: 'The "Where it’s from" tab content.',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subscriptionPrice',
      title: 'Subscription price (£/jar)',
      description:
        'Only set this once you actually want to offer a monthly subscription for this product. Leave empty to show one-time purchase only.',
      type: 'number',
    }),
    defineField({
      name: 'tastingProfile',
      title: 'Tasting profile',
      description:
        'Same fields on every honey so customers can compare batches — but only fill these in based on actually tasting/checking this specific batch. Leave any field blank rather than guess; it just won\'t show on the site until it\'s real.',
      type: 'object',
      fields: [
        defineField({
          name: 'flavour',
          title: 'Flavour',
          description: 'e.g. "Floral, light citrus, soft caramel" — based on this batch, not a generic guess.',
          type: 'string',
        }),
        defineField({
          name: 'colour',
          title: 'Colour',
          type: 'string',
          options: { list: ['Light', 'Amber', 'Dark'] },
        }),
        defineField({
          name: 'texture',
          title: 'Texture',
          type: 'string',
          options: { list: ['Runny', 'Set', 'Naturally crystallising'] },
        }),
        defineField({
          name: 'harvestSeason',
          title: 'Harvest season',
          type: 'string',
          options: { list: ['Spring', 'Summer', 'Autumn', 'Winter'] },
        }),
        defineField({
          name: 'landscape',
          title: 'Landscape',
          description: 'What the bees actually forage near, e.g. "Woodland and farmland" or "Urban meadows and riverside wildflowers".',
          type: 'string',
        }),
        defineField({
          name: 'greatWith',
          title: 'Great with',
          description: 'e.g. "Toast, porridge, strong cheese"',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'seasons',
      title: 'Season by season (optional)',
      description: 'Real harvest photos by year, if you have them.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'season',
          fields: [
            defineField({ name: 'year', title: 'Year', type: 'string' }),
            defineField({ name: 'photo', title: 'Photo', type: 'image' }),
            defineField({ name: 'note', title: 'Short note', type: 'string' }),
          ],
          preview: { select: { title: 'year', media: 'photo' } },
        },
      ],
    }),
    defineField({
      name: 'meetsGertLushStandard',
      title: 'Meets the Gert Lush Standard',
      description:
        'Only switch this on once this beekeeper has genuinely passed supplier review and this batch has genuinely passed batch acceptance — see /gert-lush-standard. This turns on a real trust claim shown to customers, not a default for every product.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'batchCode',
      title: 'Shared batch code (optional — NOT for per-jar numbers)',
      description:
        'Only for a single code shared by a whole run, e.g. "GL-BS3-26" with no jar number. Confirmed 2026-08-27: real jars are numbered individually (001, 002, 003…), so a specific code like "GL-BS3-26-001" would only be true of jar #1 — never put a per-jar number here, since this field shows the same text to every visitor regardless of which physical jar they get. The traceabilityFormat field below explains the per-jar scheme instead.',
      type: 'string',
    }),
    defineField({
      name: 'traceabilityFormat',
      title: 'Per-jar traceability code format (optional)',
      description:
        'Describes the numbering scheme without claiming one specific jar\'s number, e.g. "GL-BS3-26-XXX" — each jar\'s own code is printed on its label, not shown on the website.',
      type: 'string',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      description: 'Only active products appear on the shop and the postcode map.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'postcodeCode', media: 'heroImage' },
  },
})
