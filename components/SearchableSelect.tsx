'use client'

// Select con búsqueda por teclado. Se usa en país y estado del registro.
// Accesible: navegable con flechas, Enter elige, Escape cierra.
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export interface Option {
  value: string
  label: string
}

interface Props {
  id: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  emptyLabel?: string
  optionalLabel?: string
  className?: string
  invalid?: boolean
  autoFocus?: boolean
}

/** Normaliza para buscar sin acentos: "Mexico" encuentra "México". */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Buscar…',
  emptyLabel = 'Sin resultados',
  optionalLabel = 'Opcional',
  className = '',
  invalid,
  autoFocus,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return options
    return options.filter((o) => normalize(o.label).includes(q))
  }, [options, query])

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    setHighlight(0)
  }, [query])

  useEffect(() => {
    if (!open || !listRef.current) return
    const item = listRef.current.children[highlight] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  const choose = (next: string) => {
    onChange(next)
    setOpen(false)
    setQuery('')
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const option = filtered[highlight]
      if (open && option) choose(option.value)
      else if (!open) setOpen(true)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key === 'Backspace' && !query && value) {
      onChange('')
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={() => {
          setOpen((o) => !o)
          setQuery('')
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 text-left text-sm transition-colors dark:bg-zinc-900 ${
          invalid
            ? 'border-red-400'
            : 'border-zinc-300 focus:border-orange-500 dark:border-white/10'
        } ${selected ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
      >
        <span className="truncate">
          {selected ? selected.label : <span className="opacity-70">{optionalLabel}</span>}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
      </button>

      {selected && (
        <button
          type="button"
          aria-label="Quitar"
          onClick={(event) => {
            event.stopPropagation()
            onChange('')
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 dark:border-white/10">
            <Search className="h-3.5 w-3.5 text-zinc-400" />
            <input
              ref={inputRef}
              autoFocus={autoFocus}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              aria-label={placeholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>

          <ul ref={listRef} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {!value && (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => choose('')}
                  className="w-full px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {optionalLabel}
                </button>
              </li>
            )}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-sm text-zinc-400">{emptyLabel}</li>
            )}
            {filtered.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => choose(option.value)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    index === highlight
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  } ${option.value === value ? 'font-semibold' : ''}`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
