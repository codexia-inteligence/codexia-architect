'use client'

import { Field, TextInput, Textarea, NumInput, Btn } from './ui'
import type { FormData, Nicho } from '@/lib/types'

const NICHOS: { id: Nicho; label: string; desc: string }[] = [
  { id: 'campo', label: 'Servicios de campo', desc: 'Técnicos, instalaciones, mantenimiento' },
  { id: 'clinica', label: 'Clínicas privadas', desc: 'Médicas, dentales, veterinarias' },
  { id: 'asesoria', label: 'Asesorías y gestorías', desc: 'Contables, laborales, jurídicas' },
  { id: 'otro', label: 'Otro sector', desc: 'Nicho fuera de los anteriores' },
]

const PROBLEMAS: Record<Nicho, string[]> = {
  campo: [
    'Servicios no facturados',
    'Planificación manual del CEO',
    'Sin visibilidad de rentabilidad',
    'Incidencias sin seguimiento',
    'Facturación retrasada',
    'Técnicos mal asignados',
  ],
  clinica: [
    'No-shows y huecos vacíos',
    'Facturación a aseguradoras',
    'Recepción desbordada',
    'Sin visibilidad entre sedes',
    'Pacientes sin seguimiento',
    'Sin rentabilidad por especialidad',
  ],
  asesoria: [
    'Clasificación manual de documentos',
    'Introducción manual de datos',
    'Picos trimestrales',
    'Sin rentabilidad por cliente',
    'Comunicación dispersa',
    'Dependencia de personas clave',
  ],
  otro: [],
}

interface Props {
  form: FormData
  onChange: (f: keyof FormData, v: FormData[keyof FormData]) => void
  onSubmit: () => void
  loading: boolean
}

export default function FormProspecto({ form, onChange, onSubmit, loading }: Props) {
  const problemas = form.nicho ? PROBLEMAS[form.nicho as Nicho] : []

  function toggleProblema(p: string) {
    const list = form.problemas.includes(p)
      ? form.problemas.filter(x => x !== p)
      : [...form.problemas, p]
    onChange('problemas', list)
  }

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto', padding: '56px 24px' }}>

      {/* Header */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
        Codexia Architect
      </p>
      <h1 style={{ fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.93, color: '#09090b', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 12 }}>
        Generar propuesta
      </h1>
      <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.65, marginBottom: 48, maxWidth: 440 }}>
        Rellena los datos del prospecto y genera dos opciones de solución listas para presentar.
      </p>

      {/* Datos prospecto */}
      <div style={{ borderTop: '2px solid #09090b', marginBottom: 40 }}>
        <div style={{ padding: '28px 0', borderBottom: '1px solid #e4e4e7' }}>
          <Field label="Empresa">
            <TextInput value={form.empresa} onChange={v => onChange('empresa', v)} placeholder="Nombre de la empresa" />
          </Field>
        </div>
        <div style={{ padding: '28px 0', borderBottom: '1px solid #e4e4e7' }}>
          <Field label="Contacto">
            <TextInput value={form.contacto} onChange={v => onChange('contacto', v)} placeholder="Nombre del interlocutor" />
          </Field>
        </div>
      </div>

      {/* Nicho */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
          Sector
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: '#e4e4e7' }}>
          {NICHOS.map(n => {
            const selected = form.nicho === n.id
            return (
              <button
                key={n.id}
                onClick={() => {
                  onChange('nicho', n.id)
                  onChange('problemas', [])
                }}
                style={{
                  background: 'white', border: 'none', cursor: 'pointer',
                  padding: '20px 24px', textAlign: 'left',
                  outline: selected ? '2px solid #0658f6' : 'none',
                  outlineOffset: -2, position: 'relative',
                  transition: 'outline 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginBottom: 3 }}>{n.label}</p>
                    <p style={{ fontSize: 11, color: '#71717a' }}>{n.desc}</p>
                  </div>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: selected ? 'none' : '1.5px solid #d4d4d8',
                    background: selected ? '#0658f6' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {selected && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Problemas */}
      {form.nicho && form.nicho !== 'otro' && problemas.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
            Problemas detectados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#e4e4e7' }}>
            {problemas.map(p => {
              const checked = form.problemas.includes(p)
              return (
                <button
                  key={p}
                  onClick={() => toggleProblema(p)}
                  style={{
                    background: checked ? '#f0f5ff' : 'white',
                    border: 'none', cursor: 'pointer', padding: '14px 20px',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: checked ? 'none' : '1.5px solid #d4d4d8',
                    background: checked ? '#0658f6' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {checked && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: checked ? '#0658f6' : '#09090b' }}>{p}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Multi-sede (clínicas) */}
      {form.nicho === 'clinica' && (
        <div style={{ marginBottom: 40 }}>
          <Field label="Número de sedes" note="Si tiene más de 1, se puede incluir dashboard multi-sede">
            <NumInput
              value={form.sedes > 1 ? form.sedes : null}
              onChange={v => onChange('sedes', v ?? 1)}
              placeholder="1"
            />
          </Field>
        </div>
      )}

      {/* Pérdida mensual */}
      <div style={{ marginBottom: 40 }}>
        <Field label="Pérdida mensual estimada" note="Opcional — necesario para calcular el ROI. Usar datos de la calculadora si la han pasado.">
          <NumInput
            value={form.perdidaMensual}
            onChange={v => onChange('perdidaMensual', v)}
            prefix="€"
            placeholder="0"
            suffix="/mes"
          />
        </Field>
      </div>

      {/* Herramientas */}
      <div style={{ marginBottom: 40 }}>
        <Field label="Herramientas que usan" note="Google Calendar, WhatsApp, A3, Sage, Holded, Doctoralia...">
          <TextInput
            value={form.herramientas}
            onChange={v => onChange('herramientas', v)}
            placeholder="Escribe las herramientas actuales"
          />
        </Field>
      </div>

      {/* Contexto */}
      <div style={{ marginBottom: 48 }}>
        <Field label="Contexto adicional" note="Cualquier detalle que ayude a personalizar la propuesta">
          <Textarea
            value={form.contexto}
            onChange={v => onChange('contexto', v)}
            placeholder="Ej: tienen 3 técnicos, trabajan con contratos anuales de mantenimiento, el CEO lleva la planificación en Excel..."
            rows={4}
          />
        </Field>
      </div>

      <Btn onClick={onSubmit} loading={loading} disabled={!form.nicho}>
        {loading ? 'Generando propuesta...' : 'Generar propuesta →'}
      </Btn>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
