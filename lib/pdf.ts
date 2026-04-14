import type { Propuesta, Opcion, FormData } from './types'

const NICHO_LABELS: Record<string, string> = {
  campo: 'Servicios de campo',
  clinica: 'Clínicas privadas',
  asesoria: 'Asesorías y gestorías',
  otro: 'Otro sector',
}

function fmt(n: number) {
  return Math.round(n).toLocaleString('es-ES') + ' €'
}

async function toDataURL(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function sectionHeader(doc: InstanceType<typeof import('jspdf').jsPDF>, text: string, y: number, W: number, margin: number) {
  doc.setFillColor(9, 9, 11)
  doc.rect(margin, y, W - margin * 2, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(text.toUpperCase(), margin + 6, y + 6.5)
  return y + 14
}

function drawOpcion(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  opcion: Opcion,
  label: string,
  accentRGB: [number, number, number],
  yStart: number,
  W: number,
  margin: number,
  contentWidth: number
): number {
  let y = yStart
  const negro: [number, number, number] = [9, 9, 11]
  const gris: [number, number, number] = [113, 113, 122]
  const bordeGris: [number, number, number] = [228, 228, 231]
  const surfaceGris: [number, number, number] = [244, 244, 245]

  // Option header bar
  doc.setFillColor(...accentRGB)
  doc.rect(margin, y, contentWidth, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(label.toUpperCase(), margin + 5, y + 5.5)
  doc.text(`${opcion.total_hours}h  ·  ${opcion.timeline}`, W - margin - 5, y + 5.5, { align: 'right' })
  y += 10

  // Option name
  doc.setFillColor(248, 248, 249)
  doc.rect(margin, y, contentWidth, 16, 'F')
  doc.setTextColor(...negro)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(opcion.name, margin + 5, y + 10.5)
  y += 18

  // Summary
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  const summaryLines = doc.splitTextToSize(opcion.summary, contentWidth - 10)
  doc.text(summaryLines, margin + 5, y)
  y += summaryLines.length * 5 + 6

  // KPIs row
  const kpiW = contentWidth / (opcion.roi ? 3 : 1)
  const kpis = [{ label: 'Inversión', value: opcion.price_range, color: negro as [number,number,number] }]
  if (opcion.roi) {
    kpis.push({ label: 'Amortización', value: `Mes ${opcion.roi.payback_month}`, color: [6, 88, 246] as [number,number,number] })
    kpis.push({ label: 'Retorno 12m', value: fmt(opcion.roi.year_return), color: [22, 163, 74] as [number,number,number] })
  }
  kpis.forEach((k, i) => {
    const kx = margin + i * kpiW
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...bordeGris)
    doc.setLineWidth(0.3)
    doc.rect(kx, y, kpiW, 16, 'FD')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text(k.label.toUpperCase(), kx + 4, y + 5.5)
    doc.setFontSize(10)
    doc.setTextColor(...k.color)
    doc.text(k.value, kx + 4, y + 12.5)
  })
  y += 20

  // Modules
  if (opcion.modules.length > 0) {
    doc.setFillColor(...surfaceGris)
    doc.rect(margin, y, contentWidth, 8, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('MÓDULOS', margin + 5, y + 5.5)
    doc.text(`${opcion.modules.reduce((s, m) => s + m.hours, 0)}h`, W - margin - 5, y + 5.5, { align: 'right' })
    y += 10

    for (const m of opcion.modules) {
      const lines = doc.splitTextToSize(m.description, contentWidth - 70)
      const rowH = Math.max(14, lines.length * 4.5 + 6)
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...bordeGris)
      doc.rect(margin, y, contentWidth, rowH, 'FD')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(m.name, margin + 5, y + 6)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gris)
      doc.text(lines, margin + 5, y + 11)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(`${m.hours}h`, W - margin - 5, y + 6, { align: 'right' })
      y += rowH
    }
    y += 4
  }

  // Agents
  if (opcion.agents.length > 0) {
    doc.setFillColor(9, 9, 11)
    doc.rect(margin, y, contentWidth, 8, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('AGENTES IA', margin + 5, y + 5.5)
    doc.text(`${opcion.agents.reduce((s, a) => s + a.hours, 0)}h`, W - margin - 5, y + 5.5, { align: 'right' })
    y += 10

    for (const a of opcion.agents) {
      const lines = doc.splitTextToSize(a.description, contentWidth - 70)
      const rowH = Math.max(14, lines.length * 4.5 + 6)
      doc.setFillColor(250, 250, 250)
      doc.setDrawColor(...bordeGris)
      doc.rect(margin, y, contentWidth, rowH, 'FD')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(`⚡ ${a.name}`, margin + 5, y + 6)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gris)
      doc.text(lines, margin + 5, y + 11)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(`${a.hours}h`, W - margin - 5, y + 6, { align: 'right' })
      y += rowH
    }
    y += 4
  }

  // Phases
  if (opcion.phases.length > 0) {
    doc.setFillColor(...surfaceGris)
    doc.rect(margin, y, contentWidth, 8, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('PLAN DE ENTREGA', margin + 5, y + 5.5)
    y += 10

    opcion.phases.forEach((f, i) => {
      const lines = doc.splitTextToSize(f.deliverables, contentWidth - 50)
      const rowH = Math.max(14, lines.length * 4.5 + 6)
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...bordeGris)
      doc.rect(margin, y, contentWidth, rowH, 'FD')
      doc.setFillColor(...accentRGB)
      doc.rect(margin, y, 2, rowH, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...gris)
      doc.text(`SEM ${f.weeks}`, margin + 5, y + 5.5)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(f.name, margin + 22, y + 6)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gris)
      doc.text(lines, margin + 22, y + 11)
      y += rowH
    })
  }

  return y + 12
}

export async function generarPropuestaPDF(propuesta: Propuesta, form: FormData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 16
  const contentWidth = W - margin * 2
  const negro: [number, number, number] = [9, 9, 11]
  const gris: [number, number, number] = [113, 113, 122]
  const bordeGris: [number, number, number] = [228, 228, 231]

  // ── COVER PAGE ──────────────────────────────────────────
  // Top accent bar
  doc.setFillColor(6, 88, 246)
  doc.rect(0, 0, W, 3, 'F')

  // Logo
  try {
    const logoData = await toDataURL('/logo.png')
    doc.addImage(logoData, 'PNG', margin, 14, 0, 10)
  } catch {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text('CODEXIA', margin, 22)
  }

  // Date top right
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text(new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), W - margin, 20, { align: 'right' })

  // Divider
  doc.setDrawColor(...bordeGris)
  doc.setLineWidth(0.4)
  doc.line(margin, 30, W - margin, 30)

  // Cover content
  let y = 52
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...gris)
  doc.text('PROPUESTA DE SOLUCIÓN', margin, y)
  y += 10

  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...negro)
  const empresaLines = doc.splitTextToSize(form.empresa || 'Propuesta de solución', contentWidth)
  doc.text(empresaLines, margin, y)
  y += empresaLines.length * 12 + 6

  if (form.contacto) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text(`Para: ${form.contacto}`, margin, y)
    y += 8
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text(NICHO_LABELS[form.nicho] || form.nicho, margin, y)
  y += 20

  // Pain statement box
  doc.setFillColor(...negro as [number, number, number])
  doc.rect(margin, y, contentWidth, 1, 'F')
  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...negro)
  doc.text('Problema identificado', margin, y)
  y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 65)
  const painLines = doc.splitTextToSize(propuesta.pain_statement, contentWidth)
  doc.text(painLines, margin, y)
  y += painLines.length * 6 + 8
  doc.setFillColor(...bordeGris as [number, number, number])
  doc.rect(margin, y, contentWidth, 0.5, 'F')
  y += 16

  // Summary of both options
  const optSummaries = [
    { label: 'Opción A — Solución completa', opt: propuesta.option_a, accent: [9, 9, 11] as [number,number,number] },
    { label: 'Opción B — Solución enfocada', opt: propuesta.option_b, accent: [6, 88, 246] as [number,number,number] },
  ]
  for (const { label, opt, accent } of optSummaries) {
    doc.setFillColor(...accent)
    doc.rect(margin, y, 3, 20, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text(label.toUpperCase(), margin + 7, y + 5)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(opt.name, margin + 7, y + 11)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text(`${opt.price_range}  ·  ${opt.timeline}  ·  ${opt.total_hours}h`, margin + 7, y + 17)
    y += 26
  }

  // Footer cover
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text('codexia.es', W / 2, 285, { align: 'center' })
  doc.setFillColor(6, 88, 246)
  doc.rect(0, 290, W, 7, 'F')

  // ── OPTION A PAGE ────────────────────────────────────────
  doc.addPage()
  doc.setFillColor(6, 88, 246)
  doc.rect(0, 0, W, 3, 'F')
  try {
    const logoData = await toDataURL('/logo.png')
    doc.addImage(logoData, 'PNG', margin, 8, 0, 8)
  } catch { /* skip */ }
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text('OPCIÓN A', W - margin, 13, { align: 'right' })
  doc.setDrawColor(...bordeGris)
  doc.setLineWidth(0.3)
  doc.line(margin, 20, W - margin, 20)

  drawOpcion(doc, propuesta.option_a, 'Opción A — Solución completa', [9, 9, 11], 24, W, margin, contentWidth)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text('codexia.es', W / 2, 285, { align: 'center' })
  doc.setFillColor(9, 9, 11)
  doc.rect(0, 290, W, 7, 'F')

  // ── OPTION B PAGE ────────────────────────────────────────
  doc.addPage()
  doc.setFillColor(6, 88, 246)
  doc.rect(0, 0, W, 3, 'F')
  try {
    const logoData = await toDataURL('/logo.png')
    doc.addImage(logoData, 'PNG', margin, 8, 0, 8)
  } catch { /* skip */ }
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text('OPCIÓN B', W - margin, 13, { align: 'right' })
  doc.setDrawColor(...bordeGris)
  doc.setLineWidth(0.3)
  doc.line(margin, 20, W - margin, 20)

  drawOpcion(doc, propuesta.option_b, 'Opción B — Solución enfocada', [6, 88, 246], 24, W, margin, contentWidth)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text('codexia.es', W / 2, 285, { align: 'center' })
  doc.setFillColor(6, 88, 246)
  doc.rect(0, 290, W, 7, 'F')

  // Save
  const filename = form.empresa
    ? `Codexia-Propuesta-${form.empresa.replace(/\s+/g, '-')}.pdf`
    : 'Codexia-Propuesta.pdf'
  doc.save(filename)
}
