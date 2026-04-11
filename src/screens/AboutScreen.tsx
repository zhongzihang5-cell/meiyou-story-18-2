import type { CSSProperties } from 'react';
import { Screen } from '../types';
import { StatusBar, NavBar } from '../components/StatusBar';

interface Props {
  goTo: (s: Screen) => void;
}

const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '16px 18px',
  marginBottom: 14,
};

const accent = '#E87850';

export default function AboutScreen({ goTo }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
      <StatusBar />
      <NavBar title="功能权益" onBack={() => goTo('home')} />

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px 24px 28px',
          WebkitOverflowScrolling: 'touch',
        }}>
        <p
          style={{
            margin: '0 0 6px',
            fontSize: 13,
            fontWeight: 600,
            color: accent,
            letterSpacing: 0.5,
          }}>
          AI 亲声讲
        </p>
        <h2
          style={{
            margin: '0 0 20px',
            fontSize: 22,
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1.35,
          }}>
          用爸爸妈妈的声音
          <br />
          给柚柚讲故事
        </h2>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 22, lineHeight: 1, color: accent }} aria-hidden>
              🎙
            </span>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>声音克隆</h3>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                录制一小段你的声音，AI 将学习声线特征，用于生成自然、贴近你说话习惯的讲读音频。
              </p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 22, lineHeight: 1, color: accent }} aria-hidden>
              ✨
            </span>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>AI 讲故事</h3>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                海量绘本与故事内容，用你的声音播放给宝宝听，哄睡、陪伴更安心。
              </p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 22, lineHeight: 1, color: accent }} aria-hidden>
              🔒
            </span>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>隐私与安全</h3>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                声音数据仅用于为你生成内容，你可随时在设置中管理或删除相关数据。
              </p>
            </div>
          </div>
        </div>

        <p style={{ margin: '8px 0 24px', fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
          具体权益以产品内说明与会员协议为准。
        </p>

        <button
          type="button"
          onClick={() => goTo('home')}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: 320,
            margin: '0 auto',
            height: 48,
            border: 'none',
            borderRadius: 24,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: 'inherit',
            background: 'linear-gradient(135deg, #E87850, #C85080)',
          }}>
          我知道了
        </button>
      </div>
    </div>
  );
}
