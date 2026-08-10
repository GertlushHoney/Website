import type { Metadata } from 'next'
import { FeatherImageTool } from '@/components/tools/feather-image-tool'

export const metadata: Metadata = {
  title: 'Soften product photo edges',
  robots: { index: false, follow: false },
}

export default function FeatherImagePage() {
  return <FeatherImageTool />
}
