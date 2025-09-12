import React from 'react'

interface FullScreenLoaderProps {
  open: boolean
}

export default function FullScreenLoader({ open }: FullScreenLoaderProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-white/60 backdrop-blur-sm">
      <div className="text-center">
        <div className="animate-spin rounded-full w-12 h-12 border-4 border-ocobo border-t-transparent mx-auto mb-4"></div>
        <p className="text-forest font-medium">Cargando...</p>
      </div>
    </div>
  )
}
