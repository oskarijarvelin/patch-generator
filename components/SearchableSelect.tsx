'use client'
import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    if (disabled) return
    setOpen(true)
    setSearch('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-left bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-1"
      >
        <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value ? selectedLabel : placeholder}
        </span>
        <svg
          className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg min-w-[180px]">
          <div className="p-1.5 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false)
                  setSearch('')
                }
              }}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No results</li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o.value}
                  onClick={() => handleSelect(o.value)}
                  className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${
                    o.value === value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {o.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
