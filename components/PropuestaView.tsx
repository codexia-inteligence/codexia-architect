'use client'

import { useState } from 'react'
import type { Propuesta, Opcion, FormData } from '@/lib/types'

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

function KPIGrid({ opcion }: { opcion: Opcion }) {
  const cols = opcion.roi ? 3 : 1
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1, background: '#e4e4e7', borderTop: '1px solid #e4e4e7' }}>
      <div style={{ background: 'white', padding: '18px 20px' }}>
        <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 5 }}>Inversión</p>
        <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: '#09090b' }}>{opcion.price_range}</p>
      </div>
      {opcion.roi && (
        <>
          <div style={{ background: 'white', padding: '18px 20px' }}>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 5 }}>Amortización</p>
            <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: '#0658f6' }}>Mes {opcion.roi.payback_month}</p>
          </div>
          <div style={{ background: 'white', padding: '18px 20px' }}>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 5 }}>Retorno 12m</p>
            <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: '#16a34a' }}>
              {Math.round(opcion.roi.year_return).toLocaleString('es-ES')} €
            </p>
          </div>
        </>
      )}
    </div>
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

function OpcionCard({ opcion, label, accent, isA }: { opcion: Opcion; label: string; accent: string; isA: boolean }) {
  const moduleHours = opcion.modules.reduce((s, m) => s + m.hours, 0)
  const agentHours = opcion.agents.reduce((s, a) => s + a.hours, 0)

  return (
    <div style={{ border: '1px solid #e4e4e7', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: accent, padding: '24px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
              {label}
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.15 }}>
              {opcion.name}
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 2 }}>
              {opcion.total_hours}h
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 2 }}>
              {opcion.timeline}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
          {opcion.summary}
        </p>
      </div>

      {/* KPIs */}
      <KPIGrid opcion={opcion} />

      {/* Modules */}
      {opcion.modules.length > 0 && (
        <>
          <SectionRow label={`Módulos · ${opcion.modules.length}`} right={`${moduleHours}h`} />
          {opcion.modules.map((m, i) => (
            <div key={i} style={{
              padding: '14px 20px',
              borderTop: '1px solid #f4f4f5',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: 'white',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{m.name}</p>
                  {m.base_module_id && <Badge>{m.base_module_id}</Badge>}
                  {m.is_custom && <Badge color="#7c3aed" bg="#f5f3ff">Custom</Badge>}
                </div>
                <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, marginBottom: 3 }}>{m.description}</p>
                <p style={{ fontSize: 10, color: '#a1a1aa' }}>Usa: {m.who_uses}</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800, color: '#09090b',
                flexShrink: 0, background: '#f4f4f5',
                padding: '4px 8px', borderRadius: 2, marginTop: 1,
              }}>
                {m.hours}h
              </span>
            </div>
          ))}
        </>
      )}

      {/* Agents */}
      {opcion.agents.length > 0 && (
        <>
          <div style={{ padding: '10px 20px', background: '#09090b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              Agentes IA · {opcion.agents.length}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{agentHours}h</span>
          </div>
          {opcion.agents.map((a, i) => (
            <div key={i} style={{
              padding: '14px 20px', borderTop: '1px solid #f0f0f0',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: '#fafafa',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 22, height: 22, background: '#09090b', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, flexShrink: 0,
                  }}>⚡</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{a.name}</p>
                  {a.capabilities_used?.length > 0 && a.capabilities_used.map(c => (
                    <Badge key={c} color="#6366f1" bg="#eef2ff">{c}</Badge>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, paddingLeft: 30 }}>{a.description}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#09090b', flexShrink: 0, background: '#f4f4f5', padding: '4px 8px', borderRadius: 2, marginTop: 1 }}>
                {a.hours}h
              </span>
            </div>
          ))}
        </>
      )}

      {/* Integrations */}
      {opcion.integrations.length > 0 && (
        <>
          <SectionRow label="Integraciones" />
          <div style={{ padding: '14px 20px', background: 'white', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {opcion.integrations.map((int, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 600, color: '#52525b', background: '#f4f4f5', border: '1px solid #e4e4e7', padding: '5px 12px', borderRadius: 2 }}>
                {int}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Phases */}
      {opcion.phases.length > 0 && (
        <>
          <SectionRow label="Plan de entrega" />
          {opcion.phases.map((f, i) => (
            <div key={i} style={{
              padding: '14px 20px', borderTop: '1px solid #f4f4f5',
              display: 'flex', gap: 16, background: 'white',
              borderLeft: `3px solid ${accent}`,
            }}>
              <div style={{ flexShrink: 0, width: 50 }}>
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', display: 'block' }}>
                  Sem
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>{f.weeks}</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginBottom: 3 }}>{f.name}</p>
                <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.55 }}>{f.deliverables}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default function PropuestaView({
  propuesta,
  form,
  onReset,
}: {
  propuesta: Propuesta
  form: FormData
  onReset: () => void
}) {
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [pdfListo, setPdfListo] = useState(false)

  async function handlePDF() {
    setGenerandoPDF(true)
    try {
      const { generarPropuestaPDF } = await import('@/lib/pdf')
      await generarPropuestaPDF(propuesta, form)
      setPdfListo(true)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerandoPDF(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#71717a', marginBottom: 10 }}>
          Propuesta generada · {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, color: '#09090b', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            {form.empresa || 'Propuesta de solución'}
          </h1>
          <button
            onClick={handlePDF}
            disabled={generandoPDF}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 9999,
              background: pdfListo ? '#16a34a' : '#09090b',
              color: 'white', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.02em', border: 'none',
              cursor: generandoPDF ? 'wait' : 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
              transition: 'filter 0.2s',
            }}
            onMouseEnter={e => { if (!generandoPDF) e.currentTarget.style.filter = 'brightness(1.15)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
          >
            {generandoPDF ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Generando...
              </>
            ) : pdfListo ? (
              <>✓ PDF descargado</>
            ) : (
              <>↓ Descargar PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Pain statement */}
      <div style={{ background: '#09090b', padding: '20px 24px', marginBottom: 32, borderLeft: '3px solid #0658f6', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: 16, bottom: -10, fontSize: 80, fontWeight: 900, color: 'rgba(255,255,255,0.03)', userSelect: 'none', lineHeight: 1 }}>!</span>
        <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
          Problema identificado
        </p>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, position: 'relative' }}>
          {propuesta.pain_statement}
        </p>
      </div>

      {/* Options side by side on wide, stacked on narrow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 40 }}>
        <OpcionCard opcion={propuesta.option_a} label="Opción A — Solución completa" accent="#09090b" isA={true} />
        <OpcionCard opcion={propuesta.option_b} label="Opción B — Solución enfocada" accent="#0658f6" isA={false} />
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={handlePDF}
          disabled={generandoPDF}
          style={{
            flex: 1, minWidth: 200, padding: '13px 24px',
            background: '#09090b', color: 'white',
            fontWeight: 700, fontSize: 13, border: 'none',
            cursor: generandoPDF ? 'wait' : 'pointer',
            fontFamily: 'inherit', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'filter 0.2s',
          }}
          onMouseEnter={e => { if (!generandoPDF) e.currentTarget.style.filter = 'brightness(1.15)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
        >
          {generandoPDF ? 'Generando PDF...' : pdfListo ? '✓ PDF generado — descargar de nuevo' : '↓ Descargar propuesta en PDF'}
        </button>
        <button
          onClick={onReset}
          style={{
            padding: '13px 24px', background: 'none',
            border: '1px solid #e4e4e7', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#71717a',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#09090b'; e.currentTarget.style.color = '#09090b' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.color = '#71717a' }}
        >
          Nueva propuesta →
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
