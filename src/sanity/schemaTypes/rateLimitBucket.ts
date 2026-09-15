import { defineField, defineType } from 'sanity'

// Internal bookkeeping only — never edited by hand, never shown as content
// anywhere on the site. One document per (action, identifier, time window)
// — see src/lib/rate-limit.ts. _id embeds all three, so a new window is
// just a new document rather than something that has to notice an old
// count has "expired". These accumulate over time; nothing currently
// deletes old ones, since Sanity storage for a handful of small documents
// per abuse attempt is cheap — a scheduled cleanup (delete anything past
// its window) would be a reasonable addition if the volume ever became
// worth tidying up, not something worth building pre-launch.
export const rateLimitBucket = defineType({
  name: 'rateLimitBucket',
  title: 'Rate Limit Bucket',
  type: 'document',
  fields: [
    defineField({
      name: 'action',
      title: 'Action',
      description: 'Which limited action/axis this bucket counts, e.g. "review-ip".',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'count',
      title: 'Hit count',
      type: 'number',
      readOnly: true,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { action: 'action', count: 'count' },
    prepare: ({ action, count }) =>
      ({ title: action, subtitle: `${count} hit${count === 1 ? '' : 's'}` }) as {
        title: string
        subtitle: string
      },
  },
})
