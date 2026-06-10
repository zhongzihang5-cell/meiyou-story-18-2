import { Suspense } from 'react'
import { literacyStaticParams } from '@/lib/staticExportParams'
import { LiteracyCardClient } from './LiteracyCardClient'

export function generateStaticParams() {
  return literacyStaticParams()
}

function LiteracyFallback() {
  return (
    <div className="phone-shell flex items-center justify-center bg-[#FBF7FF]">
      <div className="text-[#B0A0C8]">加载中...</div>
    </div>
  )
}

export default function LiteracyCardPage({ params }: { params: { id: string } }) {
  const id = params.id ?? ''
  return (
    <Suspense fallback={<LiteracyFallback />}>
      <LiteracyCardClient id={id} />
    </Suspense>
  )
}
