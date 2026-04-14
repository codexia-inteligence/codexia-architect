import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from '@/lib/systemPrompt'
import type { FormData } from '@/lib/types'

const client = new Anthropic()

const NICHO_LABELS: Record<string, string> = {
  campo: 'Servicios de campo',
  clinica: 'Clínicas privadas',
  asesoria: 'Asesorías y gestorías',
  otro: 'Otro',
}

export async function POST(req: Request) {
  const data: FormData = await req.json()

  const userMessage = `
Genera una propuesta para el siguiente prospecto:

Empresa: ${data.empresa || 'Sin nombre'}
Contacto: ${data.contacto || 'Sin datos'}
Sector: ${NICHO_LABELS[data.nicho] || data.nicho}
${data.sedes > 1 ? `Número de sedes: ${data.sedes}` : ''}
Problemas identificados: ${data.problemas.length > 0 ? data.problemas.join(', ') : 'Sin especificar'}
Pérdida mensual estimada: ${data.perdidaMensual ? `${data.perdidaMensual.toLocaleString('es-ES')} €/mes` : 'No disponible'}
Herramientas que usan actualmente: ${data.herramientas || 'No especificadas'}
Contexto adicional: ${data.contexto || 'Sin contexto adicional'}

Genera la propuesta en JSON estricto siguiendo el esquema indicado.
`.trim()

  const stream = await client.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 4000,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
