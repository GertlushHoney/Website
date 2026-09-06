import type { Metadata } from 'next'
import { SyncShippingWeightsTool } from '@/components/tools/sync-shipping-weights-tool'

export const metadata: Metadata = {
  title: 'Sync shipping weights',
  robots: { index: false, follow: false },
}

export default function SyncShippingWeightsPage() {
  return <SyncShippingWeightsTool />
}
