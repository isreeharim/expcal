import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface PDFOptions {
  fileName?: string
  elementId?: string
  scale?: number
}

export async function generateInvoicePDF({
  fileName = 'Invoice.pdf',
  elementId = 'printable-invoice-container',
  scale = 2.5,
}: PDFOptions = {}) {
  const originalElement = document.getElementById(elementId)
  if (!originalElement) {
    throw new Error('Invoice container element not found')
  }

  // Clone the invoice and render it off-screen at exact A4 portrait width.
  // IMPORTANT: do NOT set overflow:hidden on the clone — html2canvas will
  // render a blank canvas if the container clips its own content off-screen.
  const clone = originalElement.cloneNode(true) as HTMLElement
  clone.id = 'temp-pdf-clone-portrait'

  // Position off-screen but keep it in the normal flow of the document so
  // html2canvas can calculate dimensions correctly.
  clone.style.position = 'fixed'
  clone.style.top = '0'
  clone.style.left = '-9999px'

  // A4 portrait at 96dpi: 210mm ≈ 794px wide, 297mm ≈ 1122px tall
  clone.style.width = '794px'
  clone.style.maxWidth = '794px'
  clone.style.minWidth = '794px'
  clone.style.height = '1122px'
  clone.style.minHeight = '1122px'

  // Critical: must NOT set overflow:hidden — that causes blank PDF captures
  clone.style.overflow = 'visible'

  // Explicitly set flex layout matching the invoice component's Tailwind classes
  // so justify-between works even if Tailwind CSS doesn't fully apply off-screen
  clone.style.display = 'flex'
  clone.style.flexDirection = 'column'
  clone.style.justifyContent = 'space-between'
  clone.style.boxSizing = 'border-box'

  clone.style.backgroundColor = '#ffffff'
  clone.style.color = '#09090b'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  clone.style.border = '1px solid #d4d4d8'
  clone.style.zIndex = '-9999'
  clone.style.visibility = 'visible'

  document.body.appendChild(clone)

  // Small delay to let the browser paint the clone before capture
  await new Promise((r) => setTimeout(r, 100))

  try {
    const canvas = await html2canvas(clone, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1122,
      windowWidth: 794,
      windowHeight: 1122,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    // A4 Portrait: 210mm × 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 8

    const contentWidth = pageWidth - margin * 2
    const contentHeight = (canvas.height * contentWidth) / canvas.width

    if (contentHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight)
    } else {
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
  } finally {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone)
    }
  }
}
