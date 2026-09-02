import { defineField, defineType } from 'sanity'

// Overrides for the tiles on the /information hub (src/app/(site)/information/page.tsx)
// — one document per page, at most. Create one here to edit a tile's eyebrow,
// title, description or image without touching code; leave a page without a
// document and the hub falls back to its built-in default copy/image.
export const informationCard = defineType({
  name: 'informationCard',
  title: 'Information Hub Card',
  type: 'document',
  fields: [
    defineField({
      name: 'pageKey',
      title: 'Page',
      description: 'Which /information tile this overrides. Only ever create one document per page.',
      type: 'string',
      options: {
        list: [
          { title: 'Becoming a Beekeeper', value: '/becoming-a-beekeeper' },
          { title: 'Become a Supplier', value: '/become-a-supplier' },
          { title: 'The Gert Lush Standard', value: '/gert-lush-standard' },
          { title: 'Asian Hornets', value: '/asian-hornets' },
          { title: 'FAQs', value: '/faqs' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow override',
      description: "Leave blank to use the tile's normal eyebrow text.",
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Title override',
      description: "Leave blank to use the tile's normal title.",
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description override',
      description: "Leave blank to use the tile's normal description.",
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Tile image override',
      description: "Shown at the top of the card on /information. Leave blank to use the tile's normal photo.",
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'pageKey', subtitle: 'title', media: 'image' },
  },
})
