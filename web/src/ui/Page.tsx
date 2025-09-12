import React from 'react'

interface PageProps {
  title?: string
  children: React.ReactNode
}

export default function Page({ title, children }: PageProps) {
  return (
    <section className="py-4 md:py-6">
      {title && (
        <h1 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-4">
          {title}
        </h1>
      )}
      {children}
    </section>
  )
}
