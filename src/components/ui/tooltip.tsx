import React, { useState, useRef, useEffect } from 'react'

interface TooltipProviderProps {
  children: React.ReactNode
}

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipTriggerProps {
  asChild?: boolean
  className?: string
  children: React.ReactNode
}

interface TooltipContentProps {
  className?: string
  children: React.ReactNode
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

export function Tooltip({ children }: TooltipProps) {
  return <>{children}</>
}

export function TooltipTrigger({ asChild = false, className = "", children }: TooltipTriggerProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  
  const handleMouseEnter = () => {
    console.log("🖱️ Tooltip trigger hovered");
  }
  
  const handleMouseLeave = () => {
    console.log("🖱️ Tooltip trigger unhovered");
  }
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      ref: triggerRef,
      'data-tooltip-trigger': true
    })
  }
  
  return (
    <span 
      ref={triggerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-tooltip-trigger
    >
      {children}
    </span>
  )
}

export function TooltipContent({ className = "", children }: TooltipContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleMouseEnter = () => {
      console.log("🖱️ Tooltip content hovered");
      setIsVisible(true)
    }
    
    const handleMouseLeave = () => {
      console.log("🖱️ Tooltip content unhovered");
      setIsVisible(false)
    }
    
    const content = contentRef.current
    if (content) {
      content.addEventListener('mouseenter', handleMouseEnter)
      content.addEventListener('mouseleave', handleMouseLeave)
      
      return () => {
        content.removeEventListener('mouseenter', handleMouseEnter)
        content.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])
  
  // Listen for tooltip trigger events
  useEffect(() => {
    const handleTriggerEnter = () => {
      console.log("🎯 Tooltip should show");
      setIsVisible(true)
    }
    
    const handleTriggerLeave = () => {
      console.log("🎯 Tooltip should hide");
      setIsVisible(false)
    }
    
    document.addEventListener('tooltip-show', handleTriggerEnter)
    document.addEventListener('tooltip-hide', handleTriggerLeave)
    
    return () => {
      document.removeEventListener('tooltip-show', handleTriggerEnter)
      document.removeEventListener('tooltip-hide', handleTriggerLeave)
    }
  }, [])
  
  if (!isVisible) return null
  
  return (
    <div 
      ref={contentRef}
      className={`fixed z-50 bg-zinc-800 border border-zinc-600 p-2 rounded text-xs shadow-lg ${className}`}
      style={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto'
      }}
    >
      {children}
    </div>
  )
}

