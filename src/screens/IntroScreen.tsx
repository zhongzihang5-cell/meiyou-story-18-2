import { useEffect, useRef } from 'react';
import { Screen } from '../types';
import { StatusBar, NavBar } from '../components/StatusBar';

interface Props { goTo: (s: Screen) => void; }

// Waveform bar config: [delay, duration, minH, maxH, opacity]
const BARS: [number, number, number, number, number][] = [
  [0.00, 2.1, 4,  14, 0.12],
  [0.15, 1.9, 6,  20, 0.18],
  [0.05, 2.3, 8,  28, 0.28],
  [0.20, 1.8, 10, 36, 0.38],
  [0.10, 2.0, 14, 44, 0.50],
  [0.30, 1.7, 18, 52, 0.62],
  [0.05, 1.6, 22, 58, 0.75],
  [0.12, 1.5, 28, 64, 0.90],
  [0.00, 1.4, 32, 68, 1.00],
  [0.08, 1.5, 28, 64, 0.90],
  [0.18, 1.6, 22, 58, 0.75],
  [0.25, 1.7, 18, 52, 0.62],
  [0.10, 2.0, 14, 44, 0.50],
  [0.20, 1.8, 10, 36, 0.38],
  [0.05, 2.3, 8,  28, 0.28],
  [0.15, 1.9, 6,  20, 0.18],
  [0.00, 2.1, 4,  14, 0.12],
];

function Waveform() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 68 }}>
      {BARS.map(([delay, dur, minH, maxH, op], i) => (
        <div
          key={i}
          style={{
            width: i === 8 ? 5 : i >= 6 && i <= 10 ? 4 : 3,
            borderRadius: 4,
            background: `rgba(232,120,80,${op})`,
            animationName: 'waveBar',
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            // fallback height
            height: minH,
            // CSS custom props for keyframe
            ['--min-h' as any]: `${minH}px`,
            ['--max-h' as any]: `${maxH}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function IntroScreen({ goTo }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
      <style>{`
        @keyframes waveBar {
          from { height: var(--min-h); }
          to   { height: var(--max-h); }
        }
        @keyframes breathe {
          0%,100% { opacity: 0.35; transform: scale(1);   }
          50%      { opacity: 0.65; transform: scale(1.04); }
        }
        @keyframes breathe2 {
          0%,100% { opacity: 0.18; transform: scale(1);   }
          50%      { opacity: 0.38; transform: scale(1.06); }
        }
      `}</style>

      <StatusBar />
      <NavBar title="AI 亲声讲" onBack={() => goTo('home')} />

      {/* ── Main content ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 32px',
        paddingTop: 32,
      }}>

        {/* Moon decoration */}
        <div style={{ position: 'relative', width: '100%', height: 0 }}>
          <div style={{
            position: 'absolute', right: -8, top: -28,
            width: 54, height: 54,
            borderRadius: '50%',
            background: '#FFF5D6',
            opacity: 0.88,
          }} />
          <div style={{
            position: 'absolute', right: 2, top: -22,
            width: 34, height: 34,
            borderRadius: '50%',
            background: '#0b0f1a',
            opacity: 0.72,
          }} />
        </div>

        {/* Waveform */}
        <div style={{ width: '100%', marginTop: 48 }}>
          <Waveform />
          {/* mirror reflection */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            gap: 4, height: 28, marginTop: 3,
            opacity: 0.15, transform: 'scaleY(-1)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          }}>
            {BARS.map(([delay, dur, minH, maxH, op], i) => (
              <div
                key={i}
                style={{
                  width: i === 8 ? 5 : i >= 6 && i <= 10 ? 4 : 3,
                  borderRadius: 4,
                  background: `rgba(232,120,80,${op})`,
                  animationName: 'waveBar',
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                  height: minH,
                  ['--min-h' as any]: `${minH}px`,
                  ['--max-h' as any]: `${maxH}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Copy */}
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <p style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.4,
            letterSpacing: 0.3,
          }}>
            你的声音是柚柚<br />最熟悉的爱
          </p>
          <p style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.42)',
            margin: '12px 0 0',
            lineHeight: 1.7,
            letterSpacing: 0.3,
          }}>
            录下你的声音，AI帮你给柚柚讲故事。
          </p>
        </div>

        <div style={{ flex: 1 }} />

        {/* Record button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 88, height: 88 }}>
            {/* outer ring breathe */}
            <div style={{
              position: 'absolute', inset: -16, borderRadius: '50%',
              border: '1px solid rgba(232,120,80,0.18)',
              animation: 'breathe2 3s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', inset: -7, borderRadius: '50%',
              border: '1px solid rgba(232,120,80,0.28)',
              animation: 'breathe 3s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
            {/* button */}
            <div
              ref={btnRef}
              onClick={() => goTo('record')}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'linear-gradient(145deg, #E87850, #C85080)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.94)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.94)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <svg width="26" height="32" viewBox="0 0 26 32" fill="none">
                <rect x="8" y="1" width="10" height="18" rx="5" fill="white" />
                <path d="M3 15c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="13" y1="25" x2="13" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="8"  y1="31" x2="18" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.28)',
            margin: '14px 0 0', letterSpacing: 1,
          }}>
            按住录音
          </p>
        </div>

        {/* Escape link */}
        <div style={{ padding: '24px 0 40px', textAlign: 'center' }}>
          <button
            onClick={() => goTo('about')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12,
              color: 'rgba(255,255,255,0.22)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(255,255,255,0.12)',
              textUnderlineOffset: 3,
              letterSpacing: 0.5,
              padding: 8,
            }}
          >
            了解功能权益
          </button>
        </div>
      </div>
    </div>
  );
}
