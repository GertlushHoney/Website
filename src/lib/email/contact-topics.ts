// Kept out of contact.ts because a 'use server' file may only export async
// functions. The server re-checks the topic against this list, so calling the
// action directly can't put arbitrary text in the email subject.
export const CONTACT_TOPICS = [
  'Website feedback or a bug',
  'Honey from a specific postcode/area',
  'An order or subscription',
  'Wholesale or stocking Gert Lush Honey',
  'Something else',
] as const
