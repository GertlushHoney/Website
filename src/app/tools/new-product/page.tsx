import type { Metadata } from 'next'
import { NewProductTool } from '@/components/tools/new-product-tool'

export const metadata: Metadata = {
  title: 'Add a new product',
  robots: { index: false, follow: false },
}

export default function NewProductPage() {
  return <NewProductTool />
}
