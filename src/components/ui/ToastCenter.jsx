import React from 'react'

export default function ToastCenter({ children, className = '' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-transparent px-4">
      <span className={`bg-ink text-white px-4 py-3 rounded-2xl shadow-paper-lg font-body text-sm ${className}`.trim()}>
        {children}
      </span>
    </div>
  )
}
