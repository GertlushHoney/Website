import { defineField, defineType } from 'sanity'

// Matches the `beekeeper` entity in /docs/technical-architecture.md's Sanity
// content model (Phase 2) — kept intentionally minimal for now (just what
// the /beekeepers directory and profile pages actually render). Add fields
// like `apiary`/`honeyBatch` references only once those schemas exist too.
export const beekeeper = defineType({
  name: 'beekeeper',
  title: 'Beekeeper',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'area',
      title: 'General area',
      description: 'Keep this general (e.g. a postcode or place name) — never an exact address.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'honeyName',
      title: 'Associated honey',
      description: 'e.g. "Bee S3" — the postcode honey this beekeeper supplies, if any yet.',
      type: 'string',
    }),
    defineField({
      name: 'hiveScale',
      title: 'Scale of hives (optional)',
      description:
        'Roughly how many hives/colonies they keep, e.g. "Around 12 hives" — only include this if the beekeeper is happy for it to be public. Leave blank otherwise.',
      type: 'string',
    }),
    defineField({
      name: 'teaser',
      title: 'One-line teaser',
      description: 'Shown on the beekeeper directory card.',
      type: 'string',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'bio',
      title: 'Full bio',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      description: 'Only active beekeepers appear on the public directory.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers show first. Bee S3 / the founding beekeeper should be 0.',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'area', media: 'portrait' },
  },
})
