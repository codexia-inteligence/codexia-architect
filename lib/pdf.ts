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

const MAX_Y = 272   // content stops here; footer lives 272-297
const PAGE_TOP = 24 // where content starts after header on continuation pages

type Doc = InstanceType<typeof import('jspdf').jsPDF>
type RGB = [number, number, number]

const negro: RGB = [9, 9, 11]
const gris: RGB = [113, 113, 122]
const bordeGris: RGB = [228, 228, 231]
const surfaceGris: RGB = [244, 244, 245]

function addPageHeader(doc: Doc, W: number, margin: number, logoData: string | null, sideLabel: string) {
  doc.setFillColor(6, 88, 246)
  doc.rect(0, 0, W, 3, 'F')
  if (logoData) {
    try { doc.addImage(logoData, 'PNG', margin, 7, 0, 8) } catch { /* skip */ }
  }
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text(sideLabel, W - margin, 13, { align: 'right' })
  doc.setDrawColor(...bordeGris)
  doc.setLineWidth(0.3)
  doc.line(margin, 19, W - margin, 19)
}

function addPageFooter(doc: Doc, W: number, accentRGB: RGB) {
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text('codexia.es', W / 2, 283, { align: 'center' })
  doc.setFillColor(...accentRGB)
  doc.rect(0, 289, W, 8, 'F')
}

// Returns updated y. Adds new page if needed.
function ensureSpace(
  doc: Doc,
  y: number,
  needed: number,
  W: number,
  margin: number,
  logoData: string | null,
  sideLabel: string,
  accentRGB: RGB
): number {
  if (y + needed > MAX_Y) {
    addPageFooter(doc, W, accentRGB)
    doc.addPage()
    addPageHeader(doc, W, margin, logoData, sideLabel)
    return PAGE_TOP
  }
  return y
}

function drawOpcion(
  doc: Doc,
  opcion: Opcion,
  label: string,
  sideLabel: string,
  accentRGB: RGB,
  yStart: number,
  W: number,
  margin: number,
  contentWidth: number,
  logoData: string | null
): number {
  let y = yStart

  const ensure = (needed: number) => {
    y = ensureSpace(doc, y, needed, W, margin, logoData, sideLabel, accentRGB)
  }

  // Option header bar
  ensure(48)
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
  doc.rect(margin, y, contentWidth, 14, 'F')
  doc.setTextColor(...negro)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(opcion.name, margin + 5, y + 9.5)
  y += 16

  // Summary
  const summaryLines = doc.splitTextToSize(opcion.summary, contentWidth - 10)
  ensure(summaryLines.length * 5 + 8)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text(summaryLines, margin + 5, y)
  y += summaryLines.length * 5 + 6

  // KPIs row
  ensure(20)
  const kpiW = contentWidth / (opcion.roi ? 3 : 1)
  const kpis: { label: string; value: string; color: RGB }[] = [
    { label: 'Inversión', value: opcion.price_range, color: negro },
  ]
  if (opcion.roi) {
    kpis.push({ label: 'Amortización', value: `Mes ${opcion.roi.payback_month}`, color: [6, 88, 246] })
    kpis.push({ label: 'Retorno 12m', value: fmt(opcion.roi.year_return), color: [22, 163, 74] })
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

  // ── Modules ──────────────────────────────────────────────
  if (opcion.modules.length > 0) {
    ensure(12)
    doc.setFillColor(...surfaceGris)
    doc.rect(margin, y, contentWidth, 8, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('MÓDULOS', margin + 5, y + 5.5)
    doc.text(`${opcion.modules.reduce((s, m) => s + m.hours, 0)}h`, W - margin - 5, y + 5.5, { align: 'right' })
    y += 10

    for (const m of opcion.modules) {
      const descLines = doc.splitTextToSize(m.description, contentWidth - 60)
      const rowH = Math.max(16, descLines.length * 4.5 + 8)
      ensure(rowH)
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
      doc.text(descLines, margin + 5, y + 11.5)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(`${m.hours}h`, W - margin - 5, y + 6, { align: 'right' })
      y += rowH
    }
    y += 3
  }

  // ── Agents ───────────────────────────────────────────────
  if (opcion.agents.length > 0) {
    ensure(12)
    doc.setFillColor(9, 9, 11)
    doc.rect(margin, y, contentWidth, 8, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('AGENTES IA', margin + 5, y + 5.5)
    doc.text(`${opcion.agents.reduce((s, a) => s + a.hours, 0)}h`, W - margin - 5, y + 5.5, { align: 'right' })
    y += 10

    for (const a of opcion.agents) {
      const descLines = doc.splitTextToSize(a.description, contentWidth - 60)
      const rowH = Math.max(16, descLines.length * 4.5 + 8)
      ensure(rowH)
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
      doc.text(descLines, margin + 5, y + 11.5)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(`${a.hours}h`, W - margin - 5, y + 6, { align: 'right' })
      y += rowH
    }
    y += 3
  }

  // ── Phases ───────────────────────────────────────────────
  if (opcion.phases.length > 0) {
    ensure(12)
    doc.setFillColor(...surfaceGris)
    doc.rect(margin, y, contentWidth, 8, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('PLAN DE ENTREGA', margin + 5, y + 5.5)
    y += 10

    for (const f of opcion.phases) {
      const deliverLines = doc.splitTextToSize(f.deliverables, contentWidth - 52)
      const rowH = Math.max(16, deliverLines.length * 4.5 + 8)
      ensure(rowH)
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...bordeGris)
      doc.rect(margin, y, contentWidth, rowH, 'FD')
      // accent left border
      doc.setFillColor(...accentRGB)
      doc.rect(margin, y, 2.5, rowH, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...gris)
      doc.text(`SEM ${f.weeks}`, margin + 6, y + 5.5)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...negro)
      doc.text(f.name, margin + 24, y + 6)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gris)
      doc.text(deliverLines, margin + 24, y + 11.5)
      y += rowH
    }
  }

  return y + 8
}

export async function generarPropuestaPDF(propuesta: Propuesta, form: FormData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 16
  const contentWidth = W - margin * 2

  // Load logo once
  let logoData: string | null = null
  try { logoData = await toDataURL('/logo.png') } catch { /* skip */ }

  // ── COVER ──────────────────────────────────────────────────
  doc.setFillColor(6, 88, 246)
  doc.rect(0, 0, W, 3, 'F')
  if (logoData) doc.addImage(logoData, 'PNG', margin, 13, 0, 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text(
    new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    W - margin, 20, { align: 'right' }
  )
  doc.setDrawColor(...bordeGris)
  doc.setLineWidth(0.4)
  doc.line(margin, 29, W - margin, 29)

  let y = 50
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...gris)
  doc.text('PROPUESTA DE SOLUCIÓN', margin, y)
  y += 10

  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...negro)
  const empresaLines = doc.splitTextToSize(form.empresa || 'Propuesta de solución', contentWidth)
  doc.text(empresaLines, margin, y)
  y += empresaLines.length * 11 + 5

  if (form.contacto) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text(`Para: ${form.contacto}`, margin, y)
    y += 7
  }
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gris)
  doc.text(NICHO_LABELS[form.nicho] || form.nicho, margin, y)
  y += 18

  // Pain statement
  doc.setFillColor(...negro)
  doc.rect(margin, y, contentWidth, 1, 'F')
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...negro)
  doc.text('Problema identificado', margin, y)
  y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 55, 60)
  const painLines = doc.splitTextToSize(propuesta.pain_statement, contentWidth)
  doc.text(painLines, margin, y)
  y += painLines.length * 6 + 10
  doc.setFillColor(...bordeGris)
  doc.rect(margin, y, contentWidth, 0.5, 'F')
  y += 14

  // Options summary
  for (const { label, opt, accent } of [
    { label: 'Opción A — Solución completa', opt: propuesta.option_a, accent: negro as RGB },
    { label: 'Opción B — Solución enfocada', opt: propuesta.option_b, accent: [6, 88, 246] as RGB },
  ]) {
    doc.setFillColor(...accent)
    doc.rect(margin, y, 3, 22, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text(label.toUpperCase(), margin + 7, y + 5)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(opt.name, margin + 7, y + 11.5)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text(`${opt.price_range}  ·  ${opt.timeline}  ·  ${opt.total_hours}h`, margin + 7, y + 18)
    y += 28
  }

  addPageFooter(doc, W, [6, 88, 246])

  // ── OPTION A ───────────────────────────────────────────────
  doc.addPage()
  addPageHeader(doc, W, margin, logoData, 'OPCIÓN A')
  drawOpcion(doc, propuesta.option_a, 'Opción A — Solución completa', 'OPCIÓN A', negro, PAGE_TOP, W, margin, contentWidth, logoData)
  addPageFooter(doc, W, negro)

  // ── OPTION B ───────────────────────────────────────────────
  doc.addPage()
  addPageHeader(doc, W, margin, logoData, 'OPCIÓN B')
  drawOpcion(doc, propuesta.option_b, 'Opción B — Solución enfocada', 'OPCIÓN B', [6, 88, 246], PAGE_TOP, W, margin, contentWidth, logoData)
  addPageFooter(doc, W, [6, 88, 246])

  const filename = form.empresa
    ? `Codexia-Propuesta-${form.empresa.replace(/\s+/g, '-')}.pdf`
    : 'Codexia-Propuesta.pdf'
  doc.save(filename)
}
