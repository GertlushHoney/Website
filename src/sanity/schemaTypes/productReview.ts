import { defineField, defineType } from 'sanity'

// Submitted from the public site (src/lib/sanity/submit-review.ts) with
// approved defaulting to false — nothing a visitor writes appears on the
// site until someone flips it on in here. Keyed by productSlug rather than
// a reference, since honeyProduct and merchProduct share one slug/URL space
// (/shop/[slug]) and a review shouldn't care which document type it's for.
export const productReview = defineType({
  name: 'productReview',
  title: 'Product Review',
  type: 'document',
  fields: [
    defineField({
      name: 'productSlug',
      title: 'Product slug',
      description: 'Matches the product\'s own slug — /shop/[slug].',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'productName',
      title: 'Product name at time of review',
      description: 'Display only, in case a product is later renamed — not used for lookups.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviewerName',
      title: 'Reviewer name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'body',
      title: 'Review text',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(10).max(2000),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      description: 'Only approved reviews show on the product page.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'reviewerName', subtitle: 'productName', rating: 'rating', approved: 'approved' },
    prepare: ({ title, subtitle, rating, approved }) =>
      ({
        title: `${title} — ${'★'.repeat(rating ?? 0)}${'☆'.repeat(5 - (rating ?? 0))}`,
        subtitle: `${subtitle}${approved ? '' : ' (awaiting approval)'}`,
      }) as { title: string; subtitle: string },
  },
})
