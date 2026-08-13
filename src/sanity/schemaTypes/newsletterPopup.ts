import { defineField, defineType } from 'sanity'

// Content for the "join our list" popup (src/components/marketing/
// newsletter-popup.tsx) — a singleton by convention, not enforcement: only
// ever create one of these documents. getNewsletterPopup() always takes
// the first one it finds and falls back to sensible defaults if none
// exists yet, so the popup never breaks the page while this is empty.
export const newsletterPopup = defineType({
  name: 'newsletterPopup',
  title: 'Newsletter Popup',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show the popup',
      description: 'Turn the popup off site-wide without deleting this content.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body text',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'discountCode',
      title: 'Discount code',
      description:
        'The real code as it exists in Shopify (Discounts → your code) — leave blank to run the popup with no discount offer. Shown to the customer after they sign up, and must already exist in Shopify before you add it here; this field only displays it, it does not create the code.',
      type: 'string',
    }),
    defineField({
      name: 'discountLabel',
      title: 'Discount label',
      description: 'How the offer reads in the popup, e.g. "10% off your first order". Leave blank if there\'s no discount code above.',
      type: 'string',
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button label',
      type: 'string',
      initialValue: 'Join the hive',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'delaySeconds',
      title: 'Delay before showing (seconds)',
      type: 'number',
      initialValue: 6,
      validation: (rule) => rule.min(0).max(60),
    }),
  ],
})
