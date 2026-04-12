'use client'

import { useEffect, useRef } from 'react'

/**
 * 克隆完成页中央动效：同心圆光晕 + 环形波形条 + 进度环（逻辑自 qinsheng-react CloneScreen canvas）
 */
export default function CloneDoneHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 110
    canvas.height = 110
    let t = 0
    let raf = 0

    const draw = () => {
      ctx.clearRect(0, 0, 110, 110)
      const rings = [
        { r: 52, b: 0.1, sp: 0.28 },
        { r: 42, b: 0.16, sp: 0.45 },
        { r: 30, b: 0.22, sp: 0.7 },
      ]
      rings.forEach((ring, i) => {
        const pulse = Math.sin(t * ring.sp + i) * 0.04
        const g = ctx.createRadialGradient(55, 55, 0, 55, 55, ring.r + pulse * 8)
        g.addColorStop(0, `rgba(233,30,99,${(ring.b + pulse).toFixed(3)})`)
        g.addColorStop(0.55, `rgba(123,63,212,${(ring.b * 0.75 + pulse).toFixed(3)})`)
        g.addColorStop(1, 'rgba(123,63,212,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(55, 55, ring.r + pulse * 8, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.beginPath()
      ctx.arc(55, 55, 20, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(123,63,212,0.18)'
      ctx.fill()
      ctx.strokeStyle = '#7B3FD4'
      ctx.lineWidth = 1
      ctx.stroke()
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.5
        const h = 5 + Math.sin(t * 2.2 + i * 1.1) * 5
        const bx = 55 + Math.cos(angle) * 11 - 1
        const by = 55 + Math.sin(angle) * 11 - h / 2
        ctx.fillStyle = `rgba(233,30,99,${(0.55 + Math.sin(t * 2 + i) * 0.25).toFixed(3)})`
        ctx.beginPath()
        ctx.rect(bx, by, 3, h)
        ctx.fill()
      }
      const prog = (t * 0.28) % 1
      ctx.beginPath()
      ctx.arc(55, 55, 24, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2)
      ctx.strokeStyle = '#9C6FD6'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.stroke()
      t += 0.016
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative mx-auto mb-6 h-[110px] w-[110px] flex-shrink-0">
      <canvas ref={canvasRef} className="absolute inset-0" width={110} height={110} aria-hidden />
    </div>
  )
}
