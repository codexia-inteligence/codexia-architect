import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from '@/lib/systemPrompt'

const client = new Anthropic()

export async function POST(req: Request) {
  const { moduleName, moduleDescription, whoUses, empresa, nicho, problemas, contexto } = await req.json()

  const userMessage = `
Contexto del prospecto:
- Empresa: ${empresa || 'Sin nombre'}
- Sector: ${nicho}
- Problemas detectados: ${problemas?.join(', ') || 'No especificados'}
- Contexto: ${contexto || 'Sin contexto adicional'}

Expande el siguiente módulo para esta empresa concreta:
- Módulo: ${moduleName}
- Descripción base: ${moduleDescription}
- Usuarios: ${whoUses}

Sigue las instrucciones de <module_expansion> del sistema. Responde en texto libre en español.
`.trim()

  const stream = await client.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 1200,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userMessage }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
