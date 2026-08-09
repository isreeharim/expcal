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

  // Off-screen clone at exact A4 portrait width (794px ≈ 210mm at 96dpi)
  // This guarantees portrait rendering even when triggered on a narrow mobile screen.
  const clone = originalElement.cloneNode(true) as HTMLElement
  clone.id = 'temp-pdf-clone-portrait'
  clone.style.position = 'fixed'
  clone.style.top = '0'
  clone.style.left = '-9999px'
  clone.style.width = '794px'
  clone.style.maxWidth = '794px'
  clone.style.minWidth = '794px'
  clone.style.minHeight = '1122px'   // A4 height at 96dpi: 297mm ≈ 1122px
  clone.style.backgroundColor = '#ffffff'
  clone.style.color = '#09090b'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  clone.style.border = '2px solid #d4d4d8'
  clone.style.zIndex = '-9999'
  clone.style.visibility = 'visible'
  clone.style.display = 'block'

  document.body.appendChild(clone)

  try {
    // Render at 2.5x retina for crisp text on A4 portrait
    const canvas = await html2canvas(clone, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    // A4 Portrait: 210mm × 297mm — always portrait regardless of device
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
      // Multi-page: slice canvas across pages
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

    // Direct download — no browser print dialog
    pdf.save(fileName)
    return true
  } finally {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone)
    }
  }
}
