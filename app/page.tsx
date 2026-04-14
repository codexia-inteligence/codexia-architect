'use client'

import { useState } from 'react'
import Image from 'next/image'
import FormProspecto from '@/components/FormProspecto'
import PropuestaView from '@/components/PropuestaView'
import type { FormData, Propuesta } from '@/lib/types'

const DEFAULT_FORM: FormData = {
  empresa: '',
  contacto: '',
  nicho: '',
  problemas: [],
  contexto: '',
  herramientas: '',
  perdidaMensual: null,
  sedes: 1,
}

export default function HomePage() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(field: keyof FormData, value: FormData[keyof FormData]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setPropuesta(null)

    try {
      const res = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Error en el servidor')
      if (!res.body) throw new Error('Sin respuesta')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let raw = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
      }

      const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      const parsed: Propuesta = JSON.parse(clean)
      setPropuesta(parsed)
    } catch (e) {
      console.error(e)
      setError('No se pudo generar la propuesta. Revisa la API key y vuelve a intentarlo.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setPropuesta(null)
    setForm(DEFAULT_FORM)
    setError(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #e4e4e7', background: 'white', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/logo.png" alt="Codexia" height={22} width={0} style={{ width: 'auto', height: 22 }} priority />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a1a1aa' }}>
              Architect
            </span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
          </div>
        </div>
      </div>

      <main>
        {error && (
          <div style={{ maxWidth: 800, margin: '24px auto', padding: '0 24px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{error}</p>
            </div>
          </div>
        )}

        {!propuesta ? (
          <FormProspecto form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} />
        ) : (
          <PropuestaView propuesta={propuesta} form={form} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
