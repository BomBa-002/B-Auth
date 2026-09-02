import React from 'react'
import { useSettingsStore } from '@features/settings/store/settings.store'

interface Orb {
  x: number
  y: number
  radius: number
  speed: number
  phase: number
  color: 'a' | 'b' | 'c' | 'd'
}

const clampDpr = () => Math.min(window.devicePixelRatio || 1, 2)

export function AppBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const showBackground = useSettingsStore((state) => state.showBackground)
  const backgroundMotion = useSettingsStore((state) => state.backgroundMotion)
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const [parallax, setParallax] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  React.useEffect(() => {
    if (!showBackground || reducedMotion || backgroundMotion === 'off') {
      const canvas = canvasRef.current
      if (!canvas) return
      const context = canvas.getContext('2d')
      if (context) drawScene(context, canvas, backgroundMotion === 'off' || reducedMotion, [])
      return
    }

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let frame = 0
    let animationFrame = 0
    let lastTime = performance.now()
    let width = 0
    let height = 0
    let orbs: Orb[] = []

    const resize = () => {
      const dpr = clampDpr()
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!orbs.length) {
        orbs = Array.from({ length: Math.max(5, Math.min(9, Math.round(width / 180))) }, (_, index) => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 35 + Math.random() * 90,
          speed: 0.00008 + Math.random() * 0.00015,
          phase: index * 1.7,
          color: ['a', 'b', 'c', 'd'][index % 4] as Orb['color'],
        }))
      }
    }

    const draw = (time: number) => {
      if (document.visibilityState !== 'visible') return
      const delta = Math.min(time - lastTime, 50)
      lastTime = time
      frame += delta
      drawScene(context, canvas, false, orbs, frame, width, height, backgroundMotion === 'calm')
      animationFrame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !animationFrame) {
        lastTime = performance.now()
        animationFrame = requestAnimationFrame(draw)
      }
    })
    animationFrame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [backgroundMotion, reducedMotion, showBackground])

  React.useEffect(() => {
    if (backgroundMotion !== 'full' || reducedMotion) return
    const move = (event: PointerEvent) => setParallax({ x: (event.clientX / window.innerWidth - 0.5) * -16, y: (event.clientY / window.innerHeight - 0.5) * -16 })
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [backgroundMotion, reducedMotion])

  return <div aria-hidden="true" className={`app-background ${showBackground ? 'is-visible' : 'is-hidden'}`} style={{ '--par-x': `${parallax.x / 16}em`, '--par-y': `${parallax.y / 16}em` } as React.CSSProperties}><div className="app-background-scene" /><canvas ref={canvasRef} className="app-background-canvas" /></div>
}

function drawScene(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, isStatic: boolean, orbs: Orb[], frame = 0, width = canvas.clientWidth, height = canvas.clientHeight, calm = false) {
  context.clearRect(0, 0, width, height)
  orbs.forEach((orb) => {
    const drift = isStatic ? 0 : Math.sin(frame * orb.speed + orb.phase) * 0.12
    const x = orb.x + width * drift
    const y = orb.y + height * drift
    const pulse = isStatic ? 1 : 1 + Math.sin(frame / 6000 + orb.phase) * 0.05
    const gradient = context.createRadialGradient(x, y, 0, x, y, orb.radius * pulse)
    const rootStyles = getComputedStyle(document.documentElement)
    const orbColor = rootStyles.getPropertyValue(`--orb-${orb.color}`).trim()
    const orbAlpha = Number.parseFloat(rootStyles.getPropertyValue('--bg-orb-alpha')) || 0.16
    gradient.addColorStop(0, orbColor)
    gradient.addColorStop(1, 'transparent')
    context.globalAlpha = orbAlpha
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, orb.radius * pulse, 0, Math.PI * 2)
    context.fill()
  })
  context.globalAlpha = 1
  if (calm || isStatic) return
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--orb-a').trim()
  context.globalAlpha = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bg-mote-alpha')) || 0.4
  for (let index = 0; index < 12; index += 1) {
    const x = (index * 137 + frame * 0.01) % width
    const y = (height - ((index * 83 + frame * 0.012) % height))
    context.font = '0.75em sans-serif'
    context.fillText('+', x, y)
  }
  context.globalAlpha = 1
}
