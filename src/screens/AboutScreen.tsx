import type { CSSProperties } from 'react';
import { Screen } from '../types';
import { StatusBar } from '../components/StatusBar';

interface Props {
  goTo: (s: Screen) => void;
}

const accent = '#E87850';
const accentBorder = 'rgba(232, 120, 80, 0.5)';

const cardBase: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 14,
};

function CrescentMoonIcon() {
  return (
    <svg width={80} height={80} viewBox="0 0 80 80" aria-hidden style={{ display: 'block' }}>
      <defs>
        <mask id="aboutCrescentMask">
          <rect width="80" height="80" fill="white" />
          <circle cx="50" cy="38" r="24" fill="black" />
        </mask>
        <filter id="aboutMoonGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="34" cy="38" r="26" fill="#FFF5E0" fillOpacity={0.95} mask="url(#aboutCrescentMask)" filter="url(#aboutMoonGlow)" />
    </svg>
  );
}

/** 深色星空底（与产品内 benefits 深色壳一致；无独立 StarBackground 组件时内联） */
function StarryBackdrop() {
  const dots = [
    { t: 8, l: 12, s: 2, o: 0.35 },
    { t: 14, l: 78, s: 1.5, o: 0.45 },
    { t: 22, l: 44, s: 2, o: 0.25 },
    { t: 36, l: 18, s: 1, o: 0.5 },
    { t: 52, l: 88, s: 2, o: 0.3 },
    { t: 68, l: 28, s: 1.5, o: 0.4 },
    { t: 78, l: 62, s: 1, o: 0.35 },
    { t: 12, l: 56, s: 1, o: 0.28 },
    { t: 44, l: 72, s: 1.5, o: 0.32 },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 100% 70% at 50% -10%, rgba(61, 34, 96, 0.55) 0%, transparent 55%), linear-gradient(180deg, #141022 0%, #0a0712 100%)',
      }}>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: `${d.t}%`,
            left: `${d.l}%`,
            width: d.s,
            height: d.s,
            borderRadius: '50%',
            background: '#fff',
            opacity: d.o,
          }}
        />
      ))}
    </div>
  );
}

const perks: string[] = [
  '录制一小段声音，AI 学习声线特征，生成自然、贴近你习惯的讲读音频',
  '海量绘本与故事，用你的声音播放给柚柚，哄睡陪伴更安心',
  '声音数据仅用于为你生成内容，可随时在设置中管理或删除',
];

export default function AboutScreen({ goTo }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
      <StarryBackdrop />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <StatusBar />

        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 24,
          }}>
          <button
            type="button"
            onClick={() => goTo('home')}
            aria-label="关闭"
            style={{
              display: 'flex',
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 26,
              lineHeight: 1,
              fontWeight: 300,
            }}>
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 16,
          }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <CrescentMoonIcon />
          </div>

          <p
            style={{
              margin: '0 0 8px',
              fontSize: 13,
              fontWeight: 600,
              color: accent,
              letterSpacing: 0.5,
              textAlign: 'center',
            }}>
            AI 亲声讲
          </p>
          <h2
            style={{
              margin: '0 0 28px',
              fontSize: 22,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.35,
              textAlign: 'center',
            }}>
            用爸爸妈妈的声音
            <br />
            给柚柚讲故事
          </h2>

          <ul
            style={{
              margin: '0 0 28px',
              padding: 0,
              listStyle: 'none',
            }}>
            {perks.map((text, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  marginBottom: i < perks.length - 1 ? 14 : 0,
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.78)',
                  lineHeight: 1.65,
                }}>
                <span style={{ flexShrink: 0, color: accent, fontWeight: 700, fontSize: 15 }} aria-hidden>
                  ✓
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 20,
            }}>
            <div
              style={{
                ...cardBase,
                flex: 1,
                padding: '14px 12px',
                minWidth: 0,
              }}>
              <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                免费版
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, textAlign: 'center' }}>
                浏览介绍与故事预览，先了解产品能力
              </p>
            </div>

            <div
              style={{
                ...cardBase,
                flex: 1,
                padding: '14px 12px',
                minWidth: 0,
                position: 'relative',
                border: `1px solid ${accentBorder}`,
                boxShadow: '0 0 0 1px rgba(232,120,80,0.15), 0 8px 28px rgba(200,80,128,0.12)',
              }}>
              <span
                style={{
                  position: 'absolute',
                  top: -1,
                  right: 10,
                  transform: 'translateY(-50%)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #E87850, #C85080)',
                  padding: '3px 8px',
                  borderRadius: 8,
                  letterSpacing: 0.5,
                }}>
                推荐
              </span>
              <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                会员版
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, textAlign: 'center' }}>
                解锁声音克隆、AI 亲声讲读与完整内容权益
              </p>
            </div>
          </div>

          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, textAlign: 'center' }}>
            具体权益以产品内说明与会员协议为准。
          </p>
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: '20px 24px 40px',
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(180deg, transparent 0%, rgba(10,7,18,0.92) 18%, #0a0712 100%)',
          }}>
          <button
            type="button"
            onClick={() => goTo('home')}
            style={{
              display: 'block',
              width: '100%',
              height: 52,
              border: 'none',
              borderRadius: 26,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'inherit',
              background: 'linear-gradient(135deg, #E87850, #C85080)',
            }}>
            立即开通会员
          </button>
          <button
            type="button"
            onClick={() => goTo('record')}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 12,
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'inherit',
            }}>
            先免费体验 →
          </button>
        </div>
      </div>
    </div>
  );
}
