'use client'

import type { Propuesta, Opcion } from '@/lib/types'

function Badge({ children, color = '#09090b' }: { children: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 9, fontWeight: 700,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      padding: '3px 8px', background: color + '12',
      color: color, borderRadius: 2,
    }}>
      {children}
    </span>
  )
}

function OpcionCard({ opcion, label, accent }: { opcion: Opcion; label: string; accent: string }) {
  const totalModuleHours = opcion.modules.reduce((s, m) => s + m.hours, 0)
  const totalAgentHours = opcion.agents.reduce((s, a) => s + a.hours, 0)

  return (
    <div style={{ border: '1px solid #e4e4e7' }}>
      {/* Header */}
      <div style={{ background: accent, padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
            {label}
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: 2 }}>
              {opcion.total_hours}h
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: 2 }}>
              {opcion.timeline}
            </span>
          </div>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.2, marginBottom: 12 }}>
          {opcion.name}
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 520 }}>
          {opcion.summary}
        </p>
      </div>

      {/* Precio */}
      <div style={{ display: 'grid', gridTemplateColumns: opcion.roi ? 'repeat(3, 1fr)' : '1fr', gap: 1, background: '#e4e4e7' }}>
        <div style={{ background: 'white', padding: '20px 24px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 6 }}>Inversión</p>
          <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#09090b' }}>{opcion.price_range}</p>
        </div>
        {opcion.roi && (
          <>
            <div style={{ background: 'white', padding: '20px 24px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 6 }}>Amortización</p>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#0658f6' }}>Mes {opcion.roi.payback_month}</p>
            </div>
            <div style={{ background: 'white', padding: '20px 24px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', marginBottom: 6 }}>Retorno 12m</p>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#16a34a' }}>
                {Math.round(opcion.roi.year_return).toLocaleString('es-ES')} €
              </p>
            </div>
          </>
        )}
      </div>

      {/* Módulos */}
      {opcion.modules.length > 0 && (
        <div style={{ borderTop: '1px solid #e4e4e7' }}>
          <div style={{ padding: '16px 24px', background: '#f4f4f5', borderBottom: '1px solid #e4e4e7' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a', display: 'flex', justifyContent: 'space-between' }}>
              <span>Módulos · {opcion.modules.length}</span>
              <span>{totalModuleHours}h</span>
            </p>
          </div>
          {opcion.modules.map((m, i) => (
            <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid #e4e4e7', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{m.name}</p>
                  {m.base_module_id && <Badge>{m.base_module_id}</Badge>}
                  {m.is_custom && <Badge color="#7c3aed">Custom</Badge>}
                </div>
                <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.55, marginBottom: 4 }}>{m.description}</p>
                <p style={{ fontSize: 11, color: '#a1a1aa' }}>Usa: {m.who_uses}</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#09090b', flexShrink: 0, background: '#f4f4f5', padding: '3px 8px', borderRadius: 2 }}>
                {m.hours}h
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Agentes IA */}
      {opcion.agents.length > 0 && (
        <div style={{ borderTop: '1px solid #e4e4e7' }}>
          <div style={{ padding: '16px 24px', background: '#09090b', borderBottom: '1px solid #27272a' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Agentes IA · {opcion.agents.length}</span>
              <span>{totalAgentHours}h</span>
            </p>
          </div>
          {opcion.agents.map((a, i) => (
            <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid #e4e4e7', display: 'flex', gap: 16, alignItems: 'flex-start', background: '#fafafa' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, background: '#09090b', color: 'white', borderRadius: '50%', fontWeight: 900, flexShrink: 0 }}>⚡</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{a.name}</p>
                  {a.capabilities_used?.map(c => <Badge key={c} color="#6366f1">{c}</Badge>)}
                </div>
                <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.55, paddingLeft: 28 }}>{a.description}</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#09090b', flexShrink: 0, background: '#f4f4f5', padding: '3px 8px', borderRadius: 2 }}>
                {a.hours}h
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Integraciones */}
      {opcion.integrations.length > 0 && (
        <div style={{ borderTop: '1px solid #e4e4e7' }}>
          <div style={{ padding: '16px 24px', background: '#f4f4f5', borderBottom: '1px solid #e4e4e7' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a' }}>Integraciones</p>
          </div>
          <div style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {opcion.integrations.map((int, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 600, color: '#52525b', background: '#f4f4f5', border: '1px solid #e4e4e7', padding: '5px 12px', borderRadius: 2 }}>
                {int}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fases */}
      {opcion.phases.length > 0 && (
        <div style={{ borderTop: '1px solid #e4e4e7' }}>
          <div style={{ padding: '16px 24px', background: '#f4f4f5', borderBottom: '1px solid #e4e4e7' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a' }}>Plan de entrega</p>
          </div>
          {opcion.phases.map((f, i) => (
            <div key={i} style={{ padding: '16px 24px', borderBottom: i < opcion.phases.length - 1 ? '1px solid #e4e4e7' : 'none', display: 'flex', gap: 16 }}>
              <div style={{ flexShrink: 0, width: 56 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa' }}>
                  sem {f.weeks}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginBottom: 3 }}>{f.name}</p>
                <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.5 }}>{f.deliverables}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PropuestaView({
  propuesta,
  empresa,
  onReset,
}: {
  propuesta: Propuesta
  empresa: string
  onReset: () => void
}) {
  return (
    <div style={{ width: '100%', maxWidth: 672, margin: '0 auto', padding: '56px 24px' }}>

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
        Propuesta generada
      </p>
      <h1 style={{ fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.93, color: '#09090b', fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', marginBottom: 24 }}>
        {empresa || 'Propuesta de solución'}
      </h1>

      {/* Pain statement */}
      <div style={{ background: '#09090b', padding: '24px 28px', marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', right: 12, bottom: -8, fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.04)', userSelect: 'none' }}>!</span>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
          Problema identificado
        </p>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, position: 'relative' }}>
          {propuesta.pain_statement}
        </p>
      </div>

      {/* Opción A */}
      <div style={{ marginBottom: 24 }}>
        <OpcionCard opcion={propuesta.option_a} label="Opción A — Solución completa" accent="#09090b" />
      </div>

      {/* Opción B */}
      <div style={{ marginBottom: 48 }}>
        <OpcionCard opcion={propuesta.option_b} label="Opción B — Solución enfocada" accent="#0658f6" />
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          background: 'none', border: '1px solid #e4e4e7', cursor: 'pointer',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#71717a', padding: '12px 24px', fontFamily: 'inherit', width: '100%',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#09090b'; e.currentTarget.style.color = '#09090b' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.color = '#71717a' }}
      >
        Nueva propuesta →
      </button>
    </div>
  )
}
