export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'system-ui', background:'#F5F6FA' }}>
      <aside style={{ width:220, background:'#1A1A2E', display:'flex', flexDirection:'column', padding:'28px 0', flexShrink:0 }}>
        <div style={{ padding:'0 24px 28px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>🌙 美柚编辑台</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:4 }}>AI讲故事内容管理</div>
        </div>
        <nav style={{ flex:1, padding:'16px 12px' }}>
          <a href="/admin" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, marginBottom:4, color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:14 }}>📊 数据看板</a>
          <a href="/admin/review" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, marginBottom:4, color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:14 }}>🎧 故事审核</a>
          <a href="/admin/library" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, marginBottom:4, color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:14 }}>📚 内容库管理</a>
          <a href="/admin/produce" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, marginBottom:4, color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:14 }}>⚡ 触发生产</a>
        </nav>
      </aside>
      <main style={{ flex:1, padding:'32px 36px', overflowY:'auto' }}>{children}</main>
    </div>
  )
}
