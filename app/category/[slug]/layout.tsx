import { categoryStaticParams } from '@/lib/staticExportParams'

export function generateStaticParams() {
  return categoryStaticParams()
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
