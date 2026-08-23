import type { Metadata } from 'next'
import { HoneyListing } from '@/components/shop/honey-listing'

export const metadata: Metadata = {
  title: 'Honey',
  description: 'Postcode honey from Gert Lush, sourced from independent beekeepers across Britain.',
  alternates: { canonical: '/shop/honey' },
}

export default function HoneyPage() {
  return <HoneyListing />
}
