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

  // Create an off-screen clone with exact desktop A4 width (760px)
  // This guarantees perfect capture even if the original is hidden on mobile or in a tab!
  const clone = originalElement.cloneNode(true) as HTMLElement
  clone.id = 'temp-pdf-clone'
  clone.style.position = 'fixed'
  clone.style.top = '0'
  clone.style.left = '-9999px'
  clone.style.width = '760px'
  clone.style.maxWidth = '760px'
  clone.style.minWidth = '760px'
  clone.style.backgroundColor = '#ffffff'
  clone.style.color = '#09090b'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  clone.style.border = 'none'
  clone.style.padding = '36px 44px'
  clone.style.zIndex = '-9999'
  clone.style.visibility = 'visible'
  clone.style.display = 'block'

  document.body.appendChild(clone)

  try {
    // Render the clone to high-resolution canvas
    const canvas = await html2canvas(clone, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 760,
      windowWidth: 760
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    // Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = 210
    const pageHeight = 297
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

    // Direct download .pdf
    pdf.save(fileName)
    return true
  } finally {
    // Always clean up the clone
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone)
    }
  }
}
