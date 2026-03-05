import React from 'react'

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-cream-dark via-cream to-cream-dark bg-[length:200%_100%] ${className}`}
      style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-3xl shadow-paper p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex justify-between">
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonRetoCard() {
  return (
    <div className="bg-surface rounded-3xl shadow-paper-lg p-6 aspect-[3/2] flex flex-col justify-between">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="space-y-2 my-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-1 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl shadow-paper p-3 flex flex-col items-center gap-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="flex flex-col items-center mb-8">
      <Skeleton className="w-24 h-24 rounded-full mb-3" />
      <Skeleton className="h-6 w-32 mb-1" />
      <Skeleton className="h-3 w-40 mt-1" />
    </div>
  )
}
