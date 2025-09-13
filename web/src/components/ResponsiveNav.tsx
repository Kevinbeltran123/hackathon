import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import NavItem from './NavItem'

export type NavEntry = { to: string; label: string; icon?: React.ReactNode; active?: boolean }

type Props = {
  items: NavEntry[]
  rightArea?: React.ReactNode
  priority?: string[] // labels en orden de mayor prioridad (no se deben ocultar primero)
}

// Utilidad: ordenar items por prioridad (de mayor a menor prioridad)
function sortByPriority(items: NavEntry[], priority?: string[]) {
  if (!priority || priority.length === 0) return items
  const weight = (label: string) => {
    const idx = priority.indexOf(label)
    return idx === -1 ? 999 : idx
  }
  return [...items].sort((a, b) => weight(a.label) - weight(b.label))
}

export default function ResponsiveNav({ items, rightArea, priority }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<NavEntry[]>(items)
  const [overflow, setOverflow] = useState<NavEntry[]>([])
  const [open, setOpen] = useState(false)

  // Mantener visible actualizado cuando cambie items
  useEffect(() => {
    setVisible(items)
    setOverflow([])
  }, [items])

  // Medición de overflow usando ResizeObserver
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => recompute())
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Recalcular también cuando cambien estados que alteran anchura/clases
  useEffect(() => {
    recompute()
  }, [visible.length])

  const recompute = () => {
    const container = containerRef.current
    const list = listRef.current
    const right = rightRef.current
    if (!container || !list) return

    const containerWidth = container.offsetWidth
    const rightWidth = right ? right.offsetWidth + 12 : 0 // margen de resguardo
    const itemsEls = Array.from(list.children) as HTMLElement[]

    // Si no hay elementos DOM aún, salir
    if (itemsEls.length === 0) return

    // Cálculo de total visible
    const total = itemsEls.reduce((acc, el) => acc + el.offsetWidth, 0)

    // Si sobra espacio, intentar devolver elementos del overflow
    while (overflow.length > 0 && total + rightWidth + 96 <= containerWidth) {
      // devolver el primero del overflow (el que salió más recientemente va al final)
      const next = overflow[0]
      setOverflow((o) => o.slice(1))
      setVisible((v) => [...v, next])
      return // esperar al siguiente ciclo de medición
    }

    // Si falta espacio, mover elementos al overflow desde el final (menos prioritarios primero)
    const ordered = sortByPriority(visible, priority)
    let currentTotal = total
    while (ordered.length > 0 && currentTotal + rightWidth + 96 > containerWidth) {
      const toHide = ordered.pop()!
      setVisible((v) => v.filter((it) => it !== toHide))
      setOverflow((o) => [toHide, ...o])
      return
    }
  }

  // Cerrar menú "Más" al perder foco
  const summaryRef = useRef<HTMLSummaryElement>(null)

  return (
    <div ref={containerRef} className="w-full">
      <nav className="flex items-center gap-2">
        <ul ref={listRef} className="flex items-center gap-2 overflow-hidden">
          {visible.map((item) => (
            <li key={item.label} className="shrink-0">
              <NavItem to={item.to} label={item.label} icon={item.icon} active={item.active} />
            </li>
          ))}
        </ul>

        {overflow.length > 0 && (
          <details className="relative" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
            <summary
              ref={summaryRef}
              aria-haspopup="menu"
              aria-expanded={open}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white cursor-pointer select-none focus:outline-emerald-600"
              onBlur={(e) => {
                // cerrar al perder foco completo
                const current = e.currentTarget
                setTimeout(() => {
                  if (!current.closest('details')?.contains(document.activeElement)) {
                    setOpen(false)
                  }
                }, 0)
              }}
            >
              Más ▾
            </summary>
            <ul className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg p-1 z-50" role="menu">
              {overflow.map((item) => (
                <li key={item.label} role="menuitem">
                  <NavItem to={item.to} label={item.label} icon={item.icon} active={item.active} />
                </li>
              ))}
            </ul>
          </details>
        )}

        <div ref={rightRef} className="ml-auto flex items-center gap-2">
          {rightArea}
        </div>
      </nav>
    </div>
  )
}


