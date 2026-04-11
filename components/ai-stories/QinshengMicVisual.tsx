'use client'

import { forwardRef, type HTMLAttributes } from 'react'

export type QinshengMicVisualProps = HTMLAttributes<HTMLDivElement> & {
  /** 按住录音中：内圈脉冲（与落地页同色系） */
  pressing?: boolean
}

/**
 * AI亲声讲落地页与 voice-clone 录制页共用的麦克风外观（104×104 外圈 + 84×84 渐变内圈）。
 */
export const QinshengMicVisual = forwardRef<HTMLDivElement, QinshengMicVisualProps>(
  function QinshengMicVisual({ className = '', pressing, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={`relative flex h-[104px] w-[104px] flex-shrink-0 items-center justify-center ${className}`}
        {...rest}>
        <span
          className="ai-qinsheng-ring-breathe pointer-events-none absolute rounded-full"
          style={{
            width: 102,
            height: 102,
            border: '1px solid rgba(232,120,80,0.12)',
          }}
        />
        <span
          className="ai-qinsheng-ring-breathe pointer-events-none absolute rounded-full"
          style={{
            width: 94,
            height: 94,
            border: '1px solid rgba(232,120,80,0.22)',
          }}
        />
        <span
          className={`relative z-10 flex items-center justify-center rounded-full shadow-[0_8px_28px_rgba(200,80,128,0.32)] ${pressing ? 'ai-qinsheng-mic-pressing-inner' : ''}`}
          style={{
            width: 84,
            height: 84,
            background: 'linear-gradient(145deg, #E87850, #C85080)',
          }}>
          <svg width="24" height="29" viewBox="0 0 28 32" fill="none" aria-hidden className="mt-0.5">
            <rect x="8" y="1" width="12" height="19" rx="6" stroke="white" strokeWidth="1.5" />
            <path
              d="M2 17a12 12 0 0024 0"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.95"
            />
            <line x1="14" y1="29" x2="14" y2="25" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="10" y1="31" x2="18" y2="31" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
          </svg>
        </span>
      </div>
    )
  }
)
