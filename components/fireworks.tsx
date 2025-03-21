"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  color: string
  velocity: {
    x: number
    y: number
  }
  alpha: number
  gravity: number
}

interface Firework {
  x: number
  y: number
  color: string
  particles: Particle[]
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fireworksRef = useRef<Firework[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Colors for fireworks
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"]

    // Create a new firework
    const createFirework = () => {
      const x = Math.random() * canvas.width
      const y = canvas.height
      const color = colors[Math.floor(Math.random() * colors.length)]

      const particles: Particle[] = []
      const particleCount = 80 + Math.floor(Math.random() * 50)

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3

        particles.push({
          x,
          y,
          color,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          alpha: 1,
          gravity: 0.05,
        })
      }

      fireworksRef.current.push({
        x,
        y,
        color,
        particles,
      })
    }

    // Launch fireworks randomly
    const launchInterval = setInterval(() => {
      if (fireworksRef.current.length < 5) {
        createFirework()
      }
    }, 800)

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      fireworksRef.current.forEach((firework, fireworkIndex) => {
        let removeFirework = true

        firework.particles.forEach((particle, particleIndex) => {
          if (particle.alpha <= 0) {
            return
          }

          removeFirework = false

          // Update particle position
          particle.velocity.y += particle.gravity
          particle.x += particle.velocity.x
          particle.y += particle.velocity.y
          particle.alpha -= 0.005

          // Draw particle
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${Number.parseInt(particle.color.slice(1, 3), 16)}, ${Number.parseInt(particle.color.slice(3, 5), 16)}, ${Number.parseInt(particle.color.slice(5, 7), 16)}, ${particle.alpha})`
          ctx.fill()
        })

        if (removeFirework) {
          fireworksRef.current.splice(fireworkIndex, 1)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      clearInterval(launchInterval)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

