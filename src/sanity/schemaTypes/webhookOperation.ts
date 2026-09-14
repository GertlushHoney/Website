import { defineField, defineType } from 'sanity'

// Internal bookkeeping only — never edited by hand, never shown as content
// anywhere on the site. One document per individual side effect the
// order-paid webhook has completed (a single honey deduction for a single
// hamper line item, or a single experience booking), not per webhook
// delivery — that's processedWebhookEvent's job. This is the fix for "Make
// Shopify order-paid processing fully idempotent" (2026-09-14): a webhook
// that fails partway through (e.g. a hamper deduction succeeds, then an
// experience booking throws) is redelivered by Shopify and must redo only
// the failed operation, never repeat the one that already succeeded.
//
// _id is the deterministic operation id itself (see
// src/lib/sanity/webhook-operations.ts, buildOperationId) — derived from
// the webhook delivery id, an operation type, the Shopify line item id, and
// the specific honey/session affected, never a random UUID. That's what
// makes "does this exact operation already exist" a reliable, retry-safe
// question: the same logical operation always produces the same _id, so a
// redelivered webhook recomputes the identical id and finds the same
// document, no matter how many times it's retried.
export const webhookOperation = defineType({
  name: 'webhookOperation',
  title: 'Webhook Operation',
  type: 'document',
  fields: [
    defineField({
      name: 'operationId',
      title: 'Operation ID',
      description: 'Deterministic — also this document\'s _id.',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'operationType',
      title: 'Operation type',
      type: 'string',
      options: { list: ['hamper-deduction', 'experience-booking'] },
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'webhookId', title: 'Webhook delivery ID', type: 'string', readOnly: true }),
    defineField({ name: 'orderId', title: 'Shopify order ID', type: 'number', readOnly: true }),
    defineField({ name: 'orderName', title: 'Shopify order name', type: 'string', readOnly: true }),
    defineField({ name: 'lineItemId', title: 'Shopify line item ID', type: 'string', readOnly: true }),
    defineField({
      name: 'outcome',
      title: 'Outcome',
      description:
        '"completed" is a real applied side effect. "insufficient-stock"/"insufficient-capacity" are terminal, non-retryable data outcomes recorded so a redelivered webhook skips re-attempting (and re-logging) something that will fail identically every time.',
      type: 'string',
      options: { list: ['completed', 'insufficient-stock', 'insufficient-capacity'] },
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'detail',
      title: 'Detail',
      description: 'Free-text summary — e.g. "6 jars of Bee S3" or "2 places, session 2026-10-04".',
      type: 'string',
      readOnly: true,
    }),
    defineField({ name: 'completedAt', title: 'Completed at', type: 'datetime', readOnly: true }),
  ],
  preview: {
    select: { operationType: 'operationType', outcome: 'outcome', detail: 'detail' },
    prepare: ({ operationType, outcome, detail }) =>
      ({
        title: detail ?? operationType,
        subtitle: outcome,
      }) as { title: string; subtitle: string },
  },
})
