import React from 'react'

export default function InlineError({ message, className = '' }) {
  if (!message) return null

  return (
    <div className={`card border border-coral/20 text-coral text-sm font-body ${className}`.trim()}>
      {message}
    </div>
  )
}
