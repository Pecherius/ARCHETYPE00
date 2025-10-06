import React, { useState } from 'react'

interface TooltipProviderProps {
  children: React.ReactNode
}

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipTriggerProps {
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

export function TooltipTrigger({ className = "", children }: TooltipTriggerProps) {
  return <span className={className}>{children}</span>
}

export function TooltipContent({ className = "", children }: TooltipContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  return (
    <div 
      className={`absolute z-50 bg-zinc-800 border border-zinc-600 p-2 rounded text-xs ${className} ${isVisible ? 'block' : 'hidden'}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
    </div>
  )
}

