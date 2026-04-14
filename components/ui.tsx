'use client'

import { ReactNode } from 'react'

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.28em',
      textTransform: 'uppercase', color: '#71717a', marginBottom: 16,
    }}>
      {children}
    </p>
  )
}

export function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h1 style={{
        fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.93,
        color: '#09090b', fontSize: 'clamp(2rem, 5vw, 3rem)',
        userSelect: 'none', marginBottom: sub ? 12 : 0,
      }}>
        {children}
      </h1>
      {sub && (
        <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.65, maxWidth: 440, marginTop: 12 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export function Btn({
  onClick, children, disabled, loading,
}: {
  onClick?: () => void
  children: ReactNode
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%', padding: '14px 32px', borderRadius: 9999,
        background: disabled || loading ? '#d4d4d8' : '#09090b',
        color: 'white', fontWeight: 700, fontSize: 15,
        letterSpacing: '-0.01em', border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', transition: 'filter 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.filter = 'brightness(1.15)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
    >
      {loading && (
        <span style={{
          width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white', borderRadius: '50%',
          display: 'inline-block', animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {children}
    </button>
  )
}

export function Field({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 9, fontWeight: 700,
        letterSpacing: '0.25em', textTransform: 'uppercase',
        color: '#71717a', marginBottom: 10,
      }}>
        {label}
      </label>
      {children}
      {note && (
        <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 8, lineHeight: 1.5 }}>
          {note}
        </p>
      )}
    </div>
  )
}

export function TextInput({
  value, onChange, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div
      style={{ borderBottom: '2px solid #e4e4e7', transition: 'border-color 0.2s' }}
      onFocusCapture={e => (e.currentTarget.style.borderBottomColor = '#09090b')}
      onBlurCapture={e => (e.currentTarget.style.borderBottomColor = '#e4e4e7')}
    >
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          fontSize: 16, fontWeight: 600, color: '#09090b', fontFamily: 'inherit',
          paddingBottom: 8, paddingTop: 4,
        }}
      />
    </div>
  )
}

export function Textarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', background: '#f4f4f5', border: '1px solid #e4e4e7',
        borderRadius: 4, outline: 'none', resize: 'vertical',
        fontSize: 14, fontWeight: 500, color: '#09090b', fontFamily: 'inherit',
        padding: '12px 14px', lineHeight: 1.6,
      }}
    />
  )
}

export function NumInput({
  value, onChange, placeholder, prefix, suffix,
}: {
  value: number | null
  onChange: (v: number | null) => void
  placeholder?: string
  prefix?: string
  suffix?: string
}) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: '2px solid #e4e4e7', transition: 'border-color 0.2s' }}
      onFocusCapture={e => (e.currentTarget.style.borderBottomColor = '#09090b')}
      onBlurCapture={e => (e.currentTarget.style.borderBottomColor = '#e4e4e7')}
    >
      {prefix && <span style={{ fontSize: 17, fontWeight: 600, color: '#71717a' }}>{prefix}</span>}
      <input
        type="number"
        min={0}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => {
          const v = parseFloat(e.target.value)
          onChange(isNaN(v) ? null : v)
        }}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontSize: 22, fontWeight: 700, color: '#09090b', fontFamily: 'inherit',
          letterSpacing: '-0.03em', minWidth: 0,
        }}
      />
      {suffix && <span style={{ fontSize: 13, fontWeight: 600, color: '#71717a', whiteSpace: 'nowrap' }}>{suffix}</span>}
    </div>
  )
}
