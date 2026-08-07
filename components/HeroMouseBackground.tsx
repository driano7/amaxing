'use client'

import { useEffect, useRef } from 'react'

type HeroMouseBackgroundProps = {
  className?: string
}

type NodePoint = {
  x: number
  y: number
  vx: number
  vy: number
}

type TrailOptions = {
  friction: number
  trails: number
  size: number
  dampening: number
  tension: number
}

class Oscillator {
  private phase: number
  private offset: number
  private frequency: number
  private amplitude: number

  constructor(phase: number, offset: number, frequency: number, amplitude: number) {
    this.phase = phase
    this.offset = offset
    this.frequency = frequency
    this.amplitude = amplitude
  }

  update() {
    this.phase += this.frequency
    return this.offset + Math.sin(this.phase) * this.amplitude
  }
}

class TrailLine {
  private spring: number
  private friction: number
  private nodes: NodePoint[]
  private options: TrailOptions

  constructor(pos: { x: number; y: number }, options: TrailOptions, spring: number) {
    this.options = options
    this.spring = spring + 0.1 * Math.random() - 0.05
    this.friction = options.friction + 0.01 * Math.random() - 0.005
    this.nodes = []
    for (let i = 0; i < options.size; i += 1) {
      this.nodes.push({ x: pos.x, y: pos.y, vx: 0, vy: 0 })
    }
  }

  update(pos: { x: number; y: number }) {
    let spring = this.spring
    let point = this.nodes[0]
    point.vx += (pos.x - point.x) * spring
    point.vy += (pos.y - point.y) * spring

    for (let i = 0; i < this.nodes.length; i += 1) {
      point = this.nodes[i]
      if (i > 0) {
        const prev = this.nodes[i - 1]
        point.vx += (prev.x - point.x) * spring
        point.vy += (prev.y - point.y) * spring
        point.vx += prev.vx * this.options.dampening
        point.vy += prev.vy * this.options.dampening
      }
      point.vx *= this.friction
      point.vy *= this.friction
      point.x += point.vx
      point.y += point.vy
      spring *= this.options.tension
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    let x = this.nodes[0]?.x ?? 0
    let y = this.nodes[0]?.y ?? 0
    ctx.beginPath()
    ctx.moveTo(x, y)

    for (let i = 1; i < this.nodes.length - 2; i += 1) {
      const current = this.nodes[i]
      const next = this.nodes[i + 1]
      if (!current || !next) continue
      x = 0.5 * (current.x + next.x)
      y = 0.5 * (current.y + next.y)
      ctx.quadraticCurveTo(current.x, current.y, x, y)
    }

    const penultimate = this.nodes[this.nodes.length - 2]
    const last = this.nodes[this.nodes.length - 1]
    if (penultimate && last) ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y)

    ctx.stroke()
    ctx.closePath()
  }
}

export function HeroMouseBackground({ className }: HeroMouseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const coarsePointerQuery = window.matchMedia('(pointer: coarse)')
    const mobileViewportQuery = window.matchMedia('(max-width: 768px)')
    const isMobileTouch = coarsePointerQuery.matches || mobileViewportQuery.matches

    const options: TrailOptions = {
      friction: isMobileTouch ? 0.54 : 0.5,
      trails: isMobileTouch ? 24 : 20,
      size: isMobileTouch ? 42 : 50,
      dampening: isMobileTouch ? 0.28 : 0.25,
      tension: 0.98,
    }
    const strokeLightness = isMobileTouch ? 62 : 55
    const strokeAlpha = isMobileTouch ? 0.38 : 0.22
    const glowAlpha = isMobileTouch ? 0.28 : 0.14
    const strokeWidth = isMobileTouch ? 1.9 : 1
    const glowBlur = isMobileTouch ? 14 : 8

    const pointer = { x: 0, y: 0 }
    const autoCenter = { x: 0, y: 0 }
    const velocity = { x: 0, y: 0 }
    let driftTick = 0
    let autoPhase = Math.random() * Math.PI * 2
    const orbitDirection = Math.random() > 0.5 ? 1 : -1
    let autoMotionEnabled = false
    const oscillator = new Oscillator(Math.random() * Math.PI * 2, 285, 0.0015, 85)
    let width = 0
    let height = 0
    let running = true
    let rafId = 0
    let autoStartTimeoutId = 0

    let lines: TrailLine[] = []
    const createLines = () => {
      lines = []
      for (let i = 0; i < options.trails; i += 1) {
        const spring = 0.45 + (i / options.trails) * 0.025
        lines.push(new TrailLine(pointer, options, spring))
      }
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (pointer.x === 0 && pointer.y === 0) {
        pointer.x = width * 0.5
        pointer.y = height * 0.5
      }
      if (autoCenter.x === 0 && autoCenter.y === 0) {
        autoCenter.x = pointer.x
        autoCenter.y = pointer.y
      } else {
        autoCenter.x = Math.max(0, Math.min(width, autoCenter.x))
        autoCenter.y = Math.max(0, Math.min(height, autoCenter.y))
      }
      clampPointer()
      createLines()
    }

    const setPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = clientX - rect.left
      pointer.y = clientY - rect.top
      clampPointer()
    }

    const clampPointer = () => {
      const edgePadding = Math.max(12, Math.min(width, height) * 0.04)
      pointer.x = Math.max(edgePadding, Math.min(width - edgePadding, pointer.x))
      pointer.y = Math.max(edgePadding, Math.min(height - edgePadding, pointer.y))
    }

    const activateAutoMotion = () => {
      if (autoMotionEnabled) return
      autoMotionEnabled = true
      const baseSpeed = Math.max(0.95, Math.min(2.7, Math.min(width, height) * 0.0021))
      velocity.x = (Math.random() > 0.5 ? 1 : -1) * baseSpeed
      velocity.y = (Math.random() > 0.5 ? 1 : -1) * baseSpeed * 0.9
    }

    const keepSpeedInRange = () => {
      const speed = Math.hypot(velocity.x, velocity.y)
      const base = Math.max(0.95, Math.min(2.7, Math.min(width, height) * 0.0021))
      const minSpeed = base
      const maxSpeed = base * 4.2

      if (!Number.isFinite(speed) || speed < 0.0001) {
        velocity.x = base
        velocity.y = -base * 0.85
        return
      }

      if (speed < minSpeed) {
        const scale = minSpeed / speed
        velocity.x *= scale
        velocity.y *= scale
      } else if (speed > maxSpeed) {
        const scale = maxSpeed / speed
        velocity.x *= scale
        velocity.y *= scale
      }
    }

    const addVelocityDrift = () => {
      driftTick += 1
      if (driftTick % 26 !== 0) return
      velocity.x += (Math.random() - 0.5) * 0.85
      velocity.y += (Math.random() - 0.5) * 0.85
      keepSpeedInRange()
    }

    const onPointerMove = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY)
      autoCenter.x = pointer.x
      autoCenter.y = pointer.y
      activateAutoMotion()
      if (event.movementX || event.movementY) {
        velocity.x = velocity.x * 0.78 + event.movementX * 0.24
        velocity.y = velocity.y * 0.78 + event.movementY * 0.24
        keepSpeedInRange()
      }
    }

    const onPointerOver = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY)
      autoCenter.x = pointer.x
      autoCenter.y = pointer.y
      activateAutoMotion()
    }

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      if (!touch) return
      setPointer(touch.clientX, touch.clientY)
      autoCenter.x = pointer.x
      autoCenter.y = pointer.y
      activateAutoMotion()
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      if (!touch) return
      setPointer(touch.clientX, touch.clientY)
      autoCenter.x = pointer.x
      autoCenter.y = pointer.y
      activateAutoMotion()
    }

    const updateAutoMotion = () => {
      if (!autoMotionEnabled) return
      addVelocityDrift()
      const edgePadding = Math.max(12, Math.min(width, height) * 0.04)
      autoCenter.x += velocity.x
      autoCenter.y += velocity.y

      if (autoCenter.x <= edgePadding || autoCenter.x >= width - edgePadding) {
        velocity.x *= -(0.95 + Math.random() * 0.12)
        velocity.y += (Math.random() - 0.5) * 0.4
        keepSpeedInRange()
        autoCenter.x = Math.max(edgePadding, Math.min(width - edgePadding, autoCenter.x))
      }

      if (autoCenter.y <= edgePadding || autoCenter.y >= height - edgePadding) {
        velocity.y *= -(0.95 + Math.random() * 0.12)
        velocity.x += (Math.random() - 0.5) * 0.4
        keepSpeedInRange()
        autoCenter.y = Math.max(edgePadding, Math.min(height - edgePadding, autoCenter.y))
      }

      autoPhase += 0.068 * orbitDirection
      const majorBase = Math.max(72, Math.min(width, height) * 0.14)
      const minorBase = majorBase * 0.44
      const pulse = 0.82 + 0.26 * Math.sin(autoPhase * 0.37)
      const majorX = majorBase * pulse
      const majorY = majorBase * (0.7 + 0.22 * Math.cos(autoPhase * 0.29))
      const minorX = minorBase * (0.8 + 0.2 * Math.sin(autoPhase * 1.17))
      const minorY = minorBase * (0.75 + 0.25 * Math.cos(autoPhase * 0.93))
      pointer.x =
        autoCenter.x +
        Math.cos(autoPhase) * majorX +
        Math.cos(autoPhase * 2.6 + Math.PI * 0.25) * minorX
      pointer.y =
        autoCenter.y + Math.sin(autoPhase * 1.22) * majorY + Math.sin(autoPhase * 2.1) * minorY
      clampPointer()
    }

    const render = () => {
      if (!running) return
      updateAutoMotion()
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      const hue = Math.round(oscillator.update())
      const activeStrokeAlpha = autoMotionEnabled ? Math.min(0.5, strokeAlpha + 0.14) : strokeAlpha
      const activeGlowAlpha = autoMotionEnabled ? Math.min(0.4, glowAlpha + 0.1) : glowAlpha
      const activeWidth = autoMotionEnabled ? strokeWidth + 0.35 : strokeWidth
      ctx.strokeStyle = `hsla(${hue}, 95%, ${strokeLightness}%, ${activeStrokeAlpha})`
      ctx.shadowColor = `hsla(${hue}, 95%, ${strokeLightness}%, ${activeGlowAlpha})`
      ctx.shadowBlur = glowBlur
      ctx.lineWidth = activeWidth
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      for (const line of lines) {
        line.update(pointer)
        line.draw(ctx)
      }

      rafId = window.requestAnimationFrame(render)
    }

    resizeCanvas()
    autoStartTimeoutId = window.setTimeout(() => {
      activateAutoMotion()
    }, 1100)
    render()

    const onBlur = () => {
      running = false
      window.cancelAnimationFrame(rafId)
    }

    const onFocus = () => {
      if (running) return
      running = true
      render()
    }

    window.addEventListener('resize', resizeCanvas, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)

    let visible = true
    const setRunning = (next) => {
      if (visible === next) return
      visible = next
      if (visible) {
        running = true
        render()
      } else {
        running = false
        window.cancelAnimationFrame(rafId)
      }
    }
    const observer = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), {
      rootMargin: '100px 0px 100px 0px',
    })
    observer.observe(canvas)

    return () => {
      running = false
      observer.disconnect()
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(autoStartTimeoutId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full opacity-[0.96] md:opacity-90" />
    </div>
  )
}
