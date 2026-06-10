import { playerStaticParams } from '@/lib/staticExportParams'

export function generateStaticParams() {
  return playerStaticParams()
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return children
}
