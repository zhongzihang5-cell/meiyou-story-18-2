import { collectionStaticParams } from '@/lib/staticExportParams'

export function generateStaticParams() {
  return collectionStaticParams()
}

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
