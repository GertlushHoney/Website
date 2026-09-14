import { defineField, defineType } from 'sanity'

// The operational alert for a genuine overbooking conflict — created by
// src/lib/sanity/experience-booking.ts (recordBookingConflict) whenever the
// order-paid webhook finds a customer has already paid for an Experience
// place that no longer exists (two people raced for the last place; one
// necessarily loses). This can never be fixed automatically — it needs a
// human to refund or otherwise accommodate the customer — so it's recorded
// here to be genuinely discoverable in Studio, not just left in server
// logs nobody's necessarily watching. See "REVIEW EXPERIENCE OVERBOOKING"
// audit, 2026-09-13, and docs/technical-architecture.md.
export const experienceBookingConflict = defineType({
  name: 'experienceBookingConflict',
  title: 'Experience Booking Conflict',
  type: 'document',
  fields: [
    defineField({ name: 'orderId', title: 'Shopify order ID', type: 'number', readOnly: true }),
    defineField({
      name: 'orderName',
      title: 'Shopify order name',
      description: 'e.g. "#1042" — look this up in Shopify Admin to refund or contact the customer.',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'productTitle',
      title: 'Product / line item title',
      type: 'string',
      readOnly: true,
    }),
    defineField({ name: 'sessionDate', title: 'Session date', type: 'string', readOnly: true }),
    defineField({ name: 'placesRequested', title: 'Places requested', type: 'number', readOnly: true }),
    defineField({
      name: 'placesRemaining',
      title: 'Places actually remaining at the time',
      type: 'number',
      readOnly: true,
    }),
    defineField({ name: 'detectedAt', title: 'Detected at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'resolved',
      title: 'Resolved',
      description:
        'Tick once this has been dealt with (refunded, moved to another date, or otherwise sorted with the customer). Purely a checklist — nothing happens automatically when this changes.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'detectedAtDesc', by: [{ field: 'detectedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { orderName: 'orderName', sessionDate: 'sessionDate', resolved: 'resolved' },
    prepare: ({ orderName, sessionDate, resolved }) =>
      ({
        title: `${orderName ?? '(no order name)'} — ${sessionDate ?? 'unknown date'}`,
        subtitle: resolved ? 'Resolved' : '⚠ Needs attention',
      }) as { title: string; subtitle: string },
  },
})
