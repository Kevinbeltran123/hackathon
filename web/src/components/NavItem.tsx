import React from 'react'
import { Link } from 'react-router-dom'

type Props = {
  to: string
  label: string
  icon?: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export default function NavItem({ to, label, icon, active, onClick }: Props) {
  const base = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors select-none'
  const activeClass = 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow'
  const idle = 'text-gray-700 hover:bg-neutral-100'

  return (
    <Link
      to={to}
      onClick={onClick}
      role="link"
      aria-current={active ? 'page' : undefined}
      className={`${base} ${active ? activeClass : idle}`}
    >
      {icon && <span aria-hidden className="text-base">{icon}</span>}
      <span className="hidden sm:sr-only md:not-sr-only md:inline">{label}</span>
    </Link>
  )
}


