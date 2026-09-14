import { defineField, defineType } from 'sanity'

// Internal bookkeeping only — never edited by hand, never shown as content
// anywhere on the site. One document per successfully-processed webhook
// delivery (see src/lib/sanity/processed-webhooks.ts), keyed by Shopify's
// own X-Shopify-Webhook-Id so a redelivered webhook (Shopify's docs are
// explicit that this can happen — a timeout or non-200 response triggers a
// retry of the *same* delivery, same id) is recognised and skipped instead
// of re-running real side effects like honey stock deductions or
// experience-booking increments a second time. Read-only in Studio (see
// each field's readOnly) so nobody accidentally "corrects" one back into a
// state that lets a duplicate through.
export const processedWebhookEvent = defineType({
  name: 'processedWebhookEvent',
  title: 'Processed Webhook Event',
  type: 'document',
  fields: [
    defineField({
      name: 'webhookId',
      title: 'Webhook delivery ID',
      description: "Shopify's X-Shopify-Webhook-Id header — also this document's _id.",
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'topic',
      title: 'Webhook topic',
      description: 'e.g. "orders/paid".',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'orderId',
      title: 'Shopify order ID',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'orderName',
      title: 'Shopify order name',
      description: 'e.g. "#1001" — for lookup while investigating, not used programmatically.',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'processedAt',
      title: 'Processed at',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'orderName', subtitle: 'topic', processedAt: 'processedAt' },
    prepare: ({ title, subtitle, processedAt }) =>
      ({
        title: title ?? '(no order name)',
        subtitle: `${subtitle} — ${processedAt ?? 'unknown time'}`,
      }) as { title: string; subtitle: string },
  },
})
