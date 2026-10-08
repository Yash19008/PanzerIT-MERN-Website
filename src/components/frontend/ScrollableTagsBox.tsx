'use client'

import React, { useRef, useEffect } from 'react'

interface ScrollableTagsBoxProps {
  children: React.ReactNode
  className?: string
  maxHeight?: number | string
}

export function ScrollableTagsBox({
  children,
  className = 'widget-box blog-tags-scrollbar',
  maxHeight = 275
}: ScrollableTagsBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (el.scrollHeight > el.clientHeight) {
        const canScrollDown = e.deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1
        const canScrollUp = e.deltaY < 0 && el.scrollTop > 0

        if (canScrollDown || canScrollUp) {
          el.scrollTop += e.deltaY
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </div>
  )
}
