'use client'

import { useState } from 'react'
import type { Propuesta, Opcion, FormData } from '@/lib/types'
import type { PDFMode } from '@/lib/pdf'

// ── Small UI pieces ──────────────────────────────────────────

function Badge({ children, color = '#52525b', bg = '#f4f4f5' }: { children: string; color?: string; bg?: string }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 9, fontWeight: 700,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      padding: '2px 7px', background: bg, color, borderRadius: 2,
      border: `1px solid ${color}22`,
    }}>
      {children}
    </span>
  )
}

function SectionRow({ label, right }: { label: string; right?: string }) {
  return (
    <div style={{ padding: '10px 20px', background: '#f4f4f5', borderTop: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a' }}>{label}</span>
      {right && <span style={{ fontSize: 10, fontWeight: 700, color: '#52525b' }}>{right}</span>}
    </div>
  )
}

// ── Expansion modal ──────────────────────────────────────────

function ExpansionModal({ content, onClose }: { content: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        style={{
          width: '100%', maxWidth: 680, margin: '0 auto',
          background: 'white', maxHeight: '80vh', overflow: 'auto',
          padding: '32px 28px', borderTop: '3px solid #0658f6',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#71717a' }}>Expansión de módulo</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#71717a', padding: '0 4px' }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: '#09090b', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
      </div>
    </div>
  )
}

// ── Validation panel ─────────────────────────────────────────

interface ReviewResult {
  score: number
  verdict: string
  checks: { label: string; ok: boolean; note: string }[]
  risks: string[]
  suggestions: string[]
}

function ReviewPanel({ review }: { review: ReviewResult }) {
  const color = review.score >= 80 ? '#16a34a' : review.score >= 60 ? '#d97706' : '#dc2626'
  return (
    <div style={{ border: `1px solid ${color}33`, marginBottom: 32 }}>
      {/* Score header */}
      <div style={{ padding: '16px 20px', background: color + '10', borderBottom: `1px solid ${color}22`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{review.score}</span>
        </div>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color, marginBottom: 4 }}>Revisión de propuesta</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#09090b' }}>{review.verdict}</p>
        </div>
      </div>

      {/* Checks */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f4f4f5' }}>
        <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#71717a', marginBottom: 10 }}>Verificaciones</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {review.checks.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>{c.ok ? '✓' : '✗'}</span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.ok ? '#16a34a' : '#dc2626', marginRight: 6 }}>{c.label}</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>{c.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      {review.risks.length > 0 && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f4f4f5', background: '#fffbeb' }}>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d97706', marginBottom: 8 }}>Riesgos</p>
          {review.risks.map((r, i) => (
            <p key={i} style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6, marginBottom: 4 }}>— {r}</p>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {review.suggestions.length > 0 && (
        <div style={{ padding: '14px 20px' }}>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0658f6', marginBottom: 8 }}>Sugerencias</p>
          {review.suggestions.map((s, i) => (
            <p key={i} style={{ fontSize: 12, color: '#1e3a8a', lineHeight: 1.6, marginBottom: 4 }}>→ {s}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Opción card ──────────────────────────────────────────────

function OpcionCard({
  opcion, label, accent, form,
}: {
  opcion: Opcion; label: string; accent: string; form: FormData
}) {
  const [expandingModule, setExpandingModule] = useState<string | null>(null)
  const [expandContent, setExpandContent] = useState<string | null>(null)

  const moduleHours = opcion.modules.reduce((s, m) => s + m.hours, 0)
  const agentHours = opcion.agents.reduce((s, a) => s + a.hours, 0)

  async function handleExpand(moduleName: string, moduleDescription: string, whoUses: string) {
    setExpandingModule(moduleName)
    setExpandContent(null)
    try {
      const res = await fetch('/api/expandir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName, moduleDescription, whoUses,
          empresa: form.empresa, nicho: form.nicho,
          problemas: form.problemas, contexto: form.contexto,
        }),
      })
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setExpandContent(text)
      }
    } catch (e) { console.error(e) } finally { setExpandingModule(null) }
  }

  return (
    <>
      {expandContent !== null && (
        <ExpansionModal content={expandContent} onClose={() => setExpandContent(null)} />
      )}
      <div style={{ border: '1px solid #e4e4e7', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: accent, padding: '22px 22px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>
                {label}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.2 }}>
                {opcion.name}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(255,255,255,0.15)', padding: '3px 9px', borderRadius: 2 }}>{opcion.total_hours}h</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: 2 }}>{opcion.timeline}</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>{opcion.summary}</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${opcion.roi ? 3 : 1}, 1fr)`, gap: 1, background: '#e4e4e7', borderTop: '1px solid #e4e4e7' }}>
          <div style={{ background: 'white', padding: '16px 18px' }}>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>Inversión</p>
            <p style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', color: '#09090b' }}>{opcion.price_range}</p>
          </div>
          {opcion.roi && (
            <>
              <div style={{ background: 'white', padding: '16px 18px' }}>
                <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>Amortización</p>
                <p style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', color: '#0658f6' }}>Mes {opcion.roi.payback_month}</p>
              </div>
              <div style={{ background: 'white', padding: '16px 18px' }}>
                <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>Retorno 12m</p>
                <p style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', color: '#16a34a' }}>
                  {Math.round(opcion.roi.year_return).toLocaleString('es-ES')} €
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modules */}
        {opcion.modules.length > 0 && (
          <>
            <SectionRow label={`Módulos · ${opcion.modules.length}`} right={`${moduleHours}h`} />
            {opcion.modules.map((m, i) => (
              <div key={i} style={{ padding: '12px 18px', borderTop: '1px solid #f4f4f5', background: 'white' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{m.name}</p>
                      {m.base_module_id && <Badge>{m.base_module_id}</Badge>}
                      {m.is_custom && <Badge color="#7c3aed" bg="#f5f3ff">Custom</Badge>}
                    </div>
                    <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, marginBottom: 2 }}>{m.description}</p>
                    <p style={{ fontSize: 10, color: '#a1a1aa' }}>Usa: {m.who_uses}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#09090b', background: '#f4f4f5', padding: '3px 8px', borderRadius: 2 }}>{m.hours}h</span>
                    <button
                      onClick={() => handleExpand(m.name, m.description, m.who_uses)}
                      disabled={!!expandingModule}
                      style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#0658f6',
                        background: 'none', border: '1px solid #0658f620',
                        cursor: expandingModule ? 'wait' : 'pointer',
                        padding: '3px 8px', borderRadius: 2, fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {expandingModule === m.name ? '...' : 'Expandir →'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Agents */}
        {opcion.agents.length > 0 && (
          <>
            <div style={{ padding: '10px 18px', background: '#09090b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Agentes IA · {opcion.agents.length}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{agentHours}h</span>
            </div>
            {opcion.agents.map((a, i) => (
              <div key={i} style={{ padding: '12px 18px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <div style={{ width: 20, height: 20, background: '#09090b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>⚡</div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{a.name}</p>
                      {a.capabilities_used?.map(c => <Badge key={c} color="#6366f1" bg="#eef2ff">{c}</Badge>)}
                    </div>
                    <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, paddingLeft: 28 }}>{a.description}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#09090b', flexShrink: 0, background: '#f4f4f5', padding: '3px 8px', borderRadius: 2, marginTop: 1 }}>{a.hours}h</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Integrations */}
        {opcion.integrations.length > 0 && (
          <>
            <SectionRow label="Integraciones" />
            <div style={{ padding: '12px 18px', background: 'white', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {opcion.integrations.map((int, i) => (
                <span key={i} style={{ fontSize: 12, fontWeight: 600, color: '#52525b', background: '#f4f4f5', border: '1px solid #e4e4e7', padding: '4px 10px', borderRadius: 2 }}>{int}</span>
              ))}
            </div>
          </>
        )}

        {/* Phases */}
        {opcion.phases.length > 0 && (
          <>
            <SectionRow label="Plan de entrega" />
            {opcion.phases.map((f, i) => (
              <div key={i} style={{ padding: '12px 18px', borderTop: '1px solid #f4f4f5', background: 'white', borderLeft: `3px solid ${accent}` }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 46 }}>
                    <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', display: 'block' }}>Sem</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>{f.weeks}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginBottom: 2 }}>{f.name}</p>
                    <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.55 }}>{f.deliverables}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}

// ── Main view ────────────────────────────────────────────────

export default function PropuestaView({
  propuesta,
  form,
  onReset,
}: {
  propuesta: Propuesta
  form: FormData
  onReset: () => void
}) {
  const [generandoPDF, setGenerandoPDF] = useState<PDFMode | null>(null)
  const [review, setReview] = useState<ReviewResult | null>(null)
  const [revisando, setRevisando] = useState(false)

  async function handlePDF(mode: PDFMode) {
    setGenerandoPDF(mode)
    try {
      const { generarPropuestaPDF } = await import('@/lib/pdf')
      await generarPropuestaPDF(propuesta, form, mode)
    } catch (e) { console.error(e) } finally { setGenerandoPDF(null) }
  }

  async function handleRevisar() {
    setRevisando(true)
    setReview(null)
    try {
      const res = await fetch('/api/revisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propuesta, form }),
      })
      const data = await res.json()
      setReview(data)
    } catch (e) { console.error(e) } finally { setRevisando(false) }
  }

  const pdfBtns: { mode: PDFMode; label: string }[] = [
    { mode: 'solo_a', label: 'Solo Opción A' },
    { mode: 'solo_b', label: 'Solo Opción B' },
    { mode: 'completa', label: 'Completa (A + B)' },
  ]

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '44px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#71717a', marginBottom: 8 }}>
          Propuesta · {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, color: '#09090b', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
            {form.empresa || 'Propuesta de solución'}
          </h1>
          <button
            onClick={handleRevisar}
            disabled={revisando}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', border: '1px solid #e4e4e7',
              background: review ? (review.score >= 80 ? '#f0fdf4' : review.score >= 60 ? '#fffbeb' : '#fef2f2') : 'white',
              color: review ? (review.score >= 80 ? '#16a34a' : review.score >= 60 ? '#d97706' : '#dc2626') : '#52525b',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
              cursor: revisando ? 'wait' : 'pointer', fontFamily: 'inherit',
              borderRadius: 2, flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            {revisando ? (
              <><span style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Revisando...</>
            ) : review ? (
              `✓ Score: ${review.score}/100`
            ) : (
              '◈ Revisar propuesta'
            )}
          </button>
        </div>
      </div>

      {/* Review panel */}
      {review && <ReviewPanel review={review} />}

      {/* Pain statement */}
      <div style={{ background: '#09090b', padding: '18px 22px', marginBottom: 24, borderLeft: '3px solid #0658f6', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: 14, bottom: -8, fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.03)', userSelect: 'none' }}>!</span>
        <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 7 }}>Problema identificado</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)', lineHeight: 1.7 }}>{propuesta.pain_statement}</p>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 32 }}>
        <OpcionCard opcion={propuesta.option_a} label="Opción A — Solución completa" accent="#09090b" form={form} />
        <OpcionCard opcion={propuesta.option_b} label="Opción B — Solución enfocada" accent="#0658f6" form={form} />
      </div>

      {/* PDF download section */}
      <div style={{ border: '1px solid #e4e4e7', marginBottom: 16 }}>
        <div style={{ padding: '12px 18px', background: '#f4f4f5', borderBottom: '1px solid #e4e4e7' }}>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a' }}>Descargar PDF</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#e4e4e7' }}>
          {pdfBtns.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => handlePDF(mode)}
              disabled={!!generandoPDF}
              style={{
                background: generandoPDF === mode ? '#09090b' : 'white',
                color: generandoPDF === mode ? 'white' : '#09090b',
                border: 'none', cursor: generandoPDF ? 'wait' : 'pointer',
                padding: '16px 12px', fontFamily: 'inherit',
                fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!generandoPDF) { e.currentTarget.style.background = '#09090b'; e.currentTarget.style.color = 'white' } }}
              onMouseLeave={e => { if (generandoPDF !== mode) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#09090b' } }}
            >
              {generandoPDF === mode ? (
                <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Generando...</>
              ) : (
                <>↓ {label}</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          width: '100%', padding: '12px 24px', background: 'none',
          border: '1px solid #e4e4e7', cursor: 'pointer',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#71717a',
          fontFamily: 'inherit', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#09090b'; e.currentTarget.style.color = '#09090b' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.color = '#71717a' }}
      >
        Nueva propuesta →
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
