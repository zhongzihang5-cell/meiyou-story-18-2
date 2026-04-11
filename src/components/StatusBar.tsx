/** 与 IntroScreen 导航区视觉一致（深色底、白系文字） */
export function StatusBar() {
  return (
    <div
      style={{
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 28px 0',
        height: 48,
      }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>21:09</span>
      <span style={{ fontSize: 14, opacity: 0.8 }}>📶🔋</span>
    </div>
  )
}

export function NavBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexShrink: 0,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="返回"
        style={{
          position: 'absolute',
          left: 4,
          display: 'flex',
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)',
        }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>{title}</h1>
      <span style={{ position: 'absolute', right: 4, width: 36, height: 36 }} aria-hidden />
    </div>
  )
}
