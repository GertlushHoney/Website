import { defineArrayMember, defineField } from 'sanity'

// Optional extra product photos, shown after the main photo (heroImage) in
// the product-page gallery. Shared by honeyProduct and merchProduct so both
// get the same Studio editing experience. heroImage stays the single
// required "main" photo everywhere else (listing tiles, search, SEO), so
// existing products need no changes.
export const galleryField = defineField({
  name: 'gallery',
  title: 'More photos',
  description:
    'Optional. Extra photos shown after the main photo on the product page — drag to reorder. To make one of these the main photo, swap it with the Main photo above.',
  type: 'array',
  options: { layout: 'grid' },
  of: [
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Short description',
          description: 'What the photo shows, for screen readers — e.g. "Three bee plates on a table".',
          type: 'string',
        }),
      ],
    }),
  ],
})
