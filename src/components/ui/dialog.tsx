import React from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ className = "", children }: DialogContentProps) {
  return (
    <div className={`bg-black border border-zinc-700 p-6 rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ className = "", children }: DialogTitleProps) {
  return <h2 className={`text-lg font-semibold text-zinc-100 ${className}`}>{children}</h2>
}

