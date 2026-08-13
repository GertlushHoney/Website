import { defineField, defineType } from 'sanity'

// Overrides for the tiles on the /shop grid (src/app/(site)/shop/page.tsx)
// — one document per category, at most. Create one here to swap a tile's
// image, label or fit without touching code; leave a category without a
// document and the page falls back to its built-in default image (or, for
// a category with exactly one real product, that product's own photo).
export const shopTile = defineType({
  name: 'shopTile',
  title: 'Shop Tile',
  type: 'document',
  fields: [
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Which /shop tile this overrides. Only ever create one document per category.',
      type: 'string',
      options: {
        list: [
          { title: 'Honey', value: 'honey' },
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
      name: 'label',
      title: 'Label override',
      description: 'Leave blank to use the category\'s normal name.',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Tile image',
      description:
        'Shown on the /shop grid. Takes priority over a single product\'s own photo — use this for a purpose-composed shot rather than reusing a listing image as-is.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'fit',
      title: 'Image fit',
      description:
        '"Contain" for an isolated product cutout shown with padding (most tiles). "Cover" for a full-bleed landscape/background photo (e.g. Experiences).',
      type: 'string',
      options: {
        list: [
          { title: 'Contain (product cutout)', value: 'contain' },
          { title: 'Cover (full-bleed photo)', value: 'cover' },
        ],
      },
      initialValue: 'contain',
    }),
  ],
  preview: {
    select: { title: 'category', subtitle: 'label', media: 'image' },
  },
})
