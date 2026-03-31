import { Suspense } from 'react'
import { LiteracyCardClient } from './LiteracyCardClient'

function LiteracyFallback() {
  return (
    <div className="phone-shell flex items-center justify-center min-h-[100dvh] bg-[#FBF7FF]">
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
