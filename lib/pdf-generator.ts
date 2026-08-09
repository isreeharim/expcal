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
  scale = 2.5
}: PDFOptions = {}) {
  const originalElement = document.getElementById(elementId)
  if (!originalElement) {
    throw new Error('Invoice container element not found')
  }

  // Create an off-screen clone with exact Landscape width (1000px)
  // This guarantees perfect capture in Landscape even if triggered on mobile!
  const clone = originalElement.cloneNode(true) as HTMLElement
  clone.id = 'temp-pdf-clone-landscape'
  clone.style.position = 'fixed'
  clone.style.top = '0'
  clone.style.left = '-9999px'
  clone.style.width = '1000px'
  clone.style.maxWidth = '1000px'
  clone.style.minWidth = '1000px'
  clone.style.backgroundColor = '#ffffff'
  clone.style.color = '#09090b'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  clone.style.border = 'none'
  clone.style.padding = '28px 36px'
  clone.style.zIndex = '-9999'
  clone.style.visibility = 'visible'
  clone.style.display = 'block'

  document.body.appendChild(clone)

  try {
    // Render the clone to high-resolution canvas in landscape
    const canvas = await html2canvas(clone, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 1000,
      windowWidth: 1000
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    // ALWAYS A4 Landscape (297mm width x 210mm height)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = 297
    const pageHeight = 210
    const margin = 10

    const contentWidth = pageWidth - margin * 2
    const contentHeight = (canvas.height * contentWidth) / canvas.width

    if (contentHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight)
    } else {
      let heightLeft = contentHeight
      let position = margin

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight)
        heightLeft -= pageHeight
      }
    }

    // Direct download landscape .pdf
    pdf.save(fileName)
    return true
  } finally {
    // Always clean up the clone
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone)
    }
  }
}
