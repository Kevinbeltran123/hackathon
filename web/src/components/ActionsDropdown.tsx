import React, { useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

export type Item = {
  key: string
  label: string
  to?: string
  onClick?: () => void
  icon?: React.ReactNode
  active?: boolean
}

type Props = {
  items: Item[]
}

export default function ActionsDropdown({ items }: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  // Close dropdown on navigation or outside click
  const handleItemClick = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && detailsRef.current) {
        detailsRef.current.open = false
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <details ref={detailsRef} className="relative actions-dropdown">
      <summary 
        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500 list-none transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span>📋</span>
        <span>Menú</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <ul 
        className="absolute right-0 mt-2 w-56 max-h-[70vh] overflow-auto rounded-xl border bg-white/95 backdrop-blur-md shadow-xl z-[9998] p-1"
        role="menu"
      >
        {items.map((item) => (
          <li key={item.key} role="menuitem">
            {item.to ? (
              <NavLink
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors ${
                    isActive || item.active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                  }`
                }
                aria-current={item.active ? 'page' : undefined}
                onClick={handleItemClick}
              >
                {item.icon && <span aria-hidden className="text-base">{item.icon}</span>}
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <button
                onClick={() => {
                  item.onClick?.()
                  handleItemClick()
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-gray-700"
              >
                {item.icon && <span aria-hidden className="text-base">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </details>
  )
}
