'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from './Card'
import { Card as CardType } from '@/types/Card'
import './styles/CardDetails.css'

interface CardDetailsProps {
  card: CardType
}

export default function CardDetails({ card }: CardDetailsProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const cardWrapperRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 1.5, y: 1.5 })
  const zoomRef = useRef(0.25)
  const [zoom, setZoom] = useState(0.25) // Start at 25% of screen
  const [position, setPosition] = useState({ x: 0, y: 0 }) // Start centered
  const [isAnimating, setIsAnimating] = useState(false) // Start paused
  const [animationReady, setAnimationReady] = useState(false) // Delay flag
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const lastActivityRef = useRef<number>(Date.now())
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const returnToCenterAnimationRef = useRef<number | null>(null)

  // Sync refs with state
  useEffect(() => {
    positionRef.current = position
    zoomRef.current = zoom
  }, [position, zoom])

  // Track user activity and start animation after 5 seconds of inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current
      const inactivityDelay = 5000 // 5 seconds

      if (timeSinceLastActivity >= inactivityDelay && !animationReady) {
        setAnimationReady(true)
        setIsAnimating(true)
      } else if (timeSinceLastActivity < inactivityDelay && animationReady) {
        // User became active again - stop animation
        setAnimationReady(false)
        setIsAnimating(false)
        // Reset position to center when stopping
        setPosition({ x: 0, y: 0 })
      }
    }

    // Check inactivity periodically
    const interval = setInterval(checkInactivity, 1000) // Check every second

    // Smooth return to center animation
    const returnToCenter = () => {
      const startX = positionRef.current.x
      const startY = positionRef.current.y
      const duration = 800 // ms
      const startTime = Date.now()
      
      // Cancel any existing return animation
      if (returnToCenterAnimationRef.current) {
        cancelAnimationFrame(returnToCenterAnimationRef.current)
      }
      
      const animateReturn = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth, cheeky bounce-back (easeOutCubic with slight overshoot)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        
        // Calculate new position (easing from start to center)
        const newX = startX * (1 - easeOutCubic)
        const newY = startY * (1 - easeOutCubic)
        
        setPosition({ x: newX, y: newY })
        
        if (progress < 1) {
          returnToCenterAnimationRef.current = requestAnimationFrame(animateReturn)
        } else {
          // Ensure we're exactly at center
          setPosition({ x: 0, y: 0 })
          returnToCenterAnimationRef.current = null
        }
      }
      
      animateReturn()
    }

    // Track activity events
    const handleActivity = () => {
      lastActivityRef.current = Date.now()
      if (animationReady && isAnimating) {
        // User became active - stop animation and smoothly return to center
        setAnimationReady(false)
        setIsAnimating(false)
        returnToCenter()
      }
    }

    // Listen for various activity events
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel']
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial check
    checkInactivity()

    return () => {
      clearInterval(interval)
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      if (returnToCenterAnimationRef.current) {
        cancelAnimationFrame(returnToCenterAnimationRef.current)
      }
    }
  }, [animationReady, isAnimating])

  // DVD logo bounce animation
  useEffect(() => {
    if (!isAnimating || !animationReady || isDragging) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const container = containerRef.current
    const cardWrapper = cardWrapperRef.current
    if (!container || !cardWrapper) return

    const speed = 2 // Pixels per frame
    let currentVelocityX = velocityRef.current.x * speed
    let currentVelocityY = velocityRef.current.y * speed

    const animate = () => {
      if (!isAnimating || !animationReady || isDragging || !container || !cardWrapper) {
        animationFrameRef.current = null
        return
      }

      const containerRect = container.getBoundingClientRect()
      const cardRect = cardWrapper.getBoundingClientRect()
      
      // Use refs for current values (don't depend on state)
      let currentX = positionRef.current.x
      let currentY = positionRef.current.y

      // Get actual card dimensions from the rendered element
      const cardWidth = cardRect.width
      const cardHeight = cardRect.height

      // Get card-display element to use its actual visible bounds
      const cardDisplay = container.querySelector('.card-display') as HTMLElement
      
      // Use card-display bounds if available, otherwise fall back to container
      let displayRect: DOMRect
      if (cardDisplay) {
        displayRect = cardDisplay.getBoundingClientRect()
      } else {
        displayRect = containerRect
      }
      
      // Calculate boundaries using the visible area of card-display
      // Position is relative to center (0,0), so boundaries are calculated from center
      const availableWidth = displayRect.width
      const availableHeight = displayRect.height

      // Update position
      currentX += currentVelocityX
      currentY += currentVelocityY

      // Calculate boundaries - ensure card edge stays at visible edge
      // Top/bottom: half the visible height minus half the card
      // Left/right: half the visible width minus half the card
      const maxX = (availableWidth / 2) - (cardWidth / 2)
      const maxY = (availableHeight / 2) - (cardHeight / 2)
      const minX = -(availableWidth / 2) + (cardWidth / 2)
      const minY = -(availableHeight / 2) + (cardHeight / 2)

      // Check boundaries and bounce with precise edge detection
      if (currentX > maxX) {
        currentVelocityX = -Math.abs(currentVelocityX) // Ensure negative velocity
        currentX = maxX // Snap to exact edge
      } else if (currentX < minX) {
        currentVelocityX = Math.abs(currentVelocityX) // Ensure positive velocity
        currentX = minX // Snap to exact edge
      }

      if (currentY > maxY) {
        currentVelocityY = -Math.abs(currentVelocityY) // Ensure negative velocity
        currentY = maxY // Snap to exact edge
      } else if (currentY < minY) {
        currentVelocityY = Math.abs(currentVelocityY) // Ensure positive velocity
        currentY = minY // Snap to exact edge
      }

      // Update velocity ref for next frame
      velocityRef.current = { x: currentVelocityX / speed, y: currentVelocityY / speed }

      // Update state
      setPosition({ x: currentX, y: currentY })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isAnimating, animationReady, isDragging]) // Depend on animation state, ready flag, and dragging

  // Handle zoom with mouse wheel
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom((prevZoom) => {
        const newZoom = Math.max(0.5, Math.min(3, prevZoom + delta))
        return newZoom
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Handle pinch zoom on touch devices
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let initialDistance = 0
    let initialZoom = 1

    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches)
        initialZoom = zoom
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const currentDistance = getDistance(e.touches)
        const scale = currentDistance / initialDistance
        const newZoom = Math.max(0.5, Math.min(3, initialZoom * scale))
        setZoom(newZoom)
      }
    }

    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [zoom])

  // Handle drag/pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    setIsDragging(true)
    setIsAnimating(false) // Pause animation when dragging
    lastActivityRef.current = Date.now() // Reset inactivity timer
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    lastActivityRef.current = Date.now() // Reset inactivity timer
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Animation will resume after inactivity timer detects no activity
  }

  // Toggle animation on double click
  const handleDoubleClick = () => {
    if (zoom === 0.25) {
      // If at 25%, zoom to 100% and stop animation
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setIsAnimating(false)
    } else {
      // If zoomed in, reset to 25% and resume animation
      setZoom(0.25)
      setPosition({ x: 0, y: 0 })
      setIsAnimating(true)
    }
  }

  const cardTransform = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
  }

  return (
    <div 
      ref={containerRef}
      className="details-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <button className="back-button" onClick={() => router.back()}>
        ← Back
      </button>

      <div className="zoom-controls">
        <button 
          className="zoom-button" 
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button 
          className="zoom-button" 
          onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
          aria-label="Zoom in"
        >
          +
        </button>
        <button 
          className="zoom-reset-button" 
          onClick={() => {
            setZoom(0.25)
            setPosition({ x: 0, y: 0 })
            setIsAnimating(true)
          }}
          aria-label="Reset zoom"
        >
          Reset
        </button>
        <button 
          className={`animation-toggle-button ${isAnimating ? 'active' : ''}`}
          onClick={() => setIsAnimating(!isAnimating)}
          aria-label="Toggle animation"
        >
          {isAnimating ? '⏸' : '▶'}
        </button>
      </div>

      <div className="zoom-instructions">
        <p>
          {!animationReady 
            ? '💤 Inactive mode • Animation starts after 10 seconds of inactivity • Drag to move • Mouse wheel to zoom • Double-click to zoom in'
            : isAnimating 
            ? '🎬 DVD Mode Active • Drag to move • Mouse wheel to zoom • Double-click to zoom in • Move mouse to pause'
            : '⏸ Animation Paused • Drag to move • Mouse wheel to zoom • Double-click for DVD mode • Stay inactive for 10s to resume'
          }
        </p>
      </div>

      <div 
        className="card-display"
        onDoubleClick={handleDoubleClick}
      >
        <div 
          ref={cardWrapperRef}
          className="card-zoom-wrapper"
          style={cardTransform}
          onMouseDown={handleMouseDown}
        >
          <Card card={card} size="large" />
        </div>
      </div>
    </div>
  )
}
