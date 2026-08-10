import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface PDFOptions {
  fileName?: string
  elementId?: string
  scale?: number
}

const PDF_SAFE_COLORS = {
  '--color-white': '#ffffff',
  '--color-zinc-50': '#fafafa',
  '--color-zinc-100': '#f4f4f5',
  '--color-zinc-200': '#e4e4e7',
  '--color-zinc-300': '#d4d4d8',
  '--color-zinc-400': '#a1a1aa',
  '--color-zinc-500': '#71717a',
  '--color-zinc-600': '#52525b',
  '--color-zinc-700': '#3f3f46',
  '--color-zinc-800': '#27272a',
  '--color-zinc-900': '#18181b',
  '--color-zinc-950': '#09090b',
  '--color-emerald-600': '#059669',
} as const

export async function generateInvoicePDF({
  fileName = 'Invoice.pdf',
  elementId = 'printable-invoice-container',
  scale = 2,
}: PDFOptions = {}) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Invoice container element not found')
  }

  // Export an unscaled copy so responsive preview transforms and hidden mobile
  // tabs never affect the PDF layout.
  const exportElement = element.cloneNode(true) as HTMLElement
  exportElement.removeAttribute('id')
  for (const [property, value] of Object.entries(PDF_SAFE_COLORS)) {
    exportElement.style.setProperty(property, value)
  }
  Object.assign(exportElement.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '760px',
    height: '1075px',
    transform: 'none',
    borderRadius: '0',
    boxShadow: 'none',
    zIndex: '-1',
  })
  document.body.appendChild(exportElement)

  let canvas: HTMLCanvasElement
  try {
    if (document.fonts?.ready) await document.fonts.ready

    canvas = await html2canvas(exportElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
    })
  } finally {
    exportElement.remove()
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.98)

  // A4 Portrait: 210mm × 297mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210   // mm
  const pageHeight = 297  // mm
  const margin = 0        // no margin — fill the page edge-to-edge

  const contentWidth = Math.min(
    pageWidth - margin * 2,
    (pageHeight - margin * 2) * (canvas.width / canvas.height)
  )
  const contentHeight = (canvas.height * contentWidth) / canvas.width

  if (contentHeight <= pageHeight - margin * 2) {
    // Fits on one page — centre vertically
    const yOffset = margin + (pageHeight - margin * 2 - contentHeight) / 2
    pdf.addImage(imgData, 'JPEG', margin, yOffset, contentWidth, contentHeight)
  } else {
    // Multi-page fallback
    let heightLeft = contentHeight
    let position = margin

    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight)
    heightLeft -= pageHeight - margin * 2

    while (heightLeft > 0) {
      position -= pageHeight - margin * 2
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight)
      heightLeft -= pageHeight - margin * 2
    }
  }

  pdf.save(fileName)
  return true
}
