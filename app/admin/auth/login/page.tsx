export default function AdminLogin() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#F5F6FA' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 48px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', textAlign:'center', width:360 }}>
        <div style={{ fontSize:32, marginBottom:12 }}>🌙</div>
        <div style={{ fontSize:22, fontWeight:700, color:'#1A1A2E', marginBottom:6 }}>美柚编辑工作台</div>
        <div style={{ fontSize:14, color:'#888', marginBottom:32 }}>请使用钉钉扫码登录</div>
        <div style={{ width:200, height:200, margin:'0 auto 24px', background:'#F5F6FA', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', border:'2px dashed #E0E0E0', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:36 }}>📱</div>
          <div style={{ fontSize:13, color:'#bbb' }}>钉钉OAuth待接入</div>
        </div>
        <a href="/admin" style={{ display:'block', padding:'12px 0', background:'linear-gradient(135deg,#1A1A2E,#6C63FF)', color:'#fff', borderRadius:8, textDecoration:'none', fontSize:15, fontWeight:700 }}>
          开发模式：直接进入
        </a>
      </div>
    </div>
  )
}
