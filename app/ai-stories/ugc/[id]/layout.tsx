import { ugcStaticParams } from '@/lib/staticExportParams'

export function generateStaticParams() {
  return ugcStaticParams()
}

export default function UgcStoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
