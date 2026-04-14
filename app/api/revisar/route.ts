import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from '@/lib/systemPrompt'

const client = new Anthropic()

const REVIEW_PROMPT = `
Eres un revisor interno de Codexia. Recibirás una propuesta generada y debes evaluarla críticamente.

Responde SOLO con JSON válido con este esquema exacto:
{
  "score": 0-100,
  "verdict": "string — una línea, veredicto directo",
  "checks": [
    { "label": "string", "ok": true|false, "note": "string — una línea" }
  ],
  "risks": ["string — riesgo concreto, máximo 2 líneas cada uno"],
  "suggestions": ["string — mejora concreta, máximo 2 líneas cada una"]
}

Revisa:
1. Opción B: ¿total_hours ≤ 65? ¿resuelve el dolor principal?
2. Opción A: ¿total_hours ≤ 130? ¿cubre todos los problemas detectados?
3. Pricing: ¿está dentro de 3.500–10.000 €? ¿coherente con las horas?
4. ROI: ¿los números tienen sentido si hay pérdida estimada?
5. Dependencias: ¿U2 está incluido? ¿todas las dependencias de módulos están cubiertas?
6. Cobertura: ¿todos los problemas marcados tienen al menos un módulo que los resuelve?
7. Agentes: ¿los agentes tienen sentido para los módulos propuestos?
`

export async function POST(req: Request) {
  const { propuesta, form } = await req.json()

  const userMessage = `
Prospecto: ${form.empresa || 'Sin nombre'} | ${form.nicho} | Problemas: ${form.problemas?.join(', ') || 'ninguno'}
Pérdida mensual: ${form.perdidaMensual ? `${form.perdidaMensual} €/mes` : 'no disponible'}

PROPUESTA GENERADA:
${JSON.stringify(propuesta, null, 2)}

Revisa esta propuesta y devuelve el JSON de revisión.
`.trim()

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1000,
    system: [{ type: 'text', text: SYSTEM_PROMPT + '\n\n' + REVIEW_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  return Response.json(JSON.parse(clean))
}
