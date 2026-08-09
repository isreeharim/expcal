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
  scale = 2,
}: PDFOptions = {}) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Invoice container element not found')
  }

  // Capture the LIVE element exactly as the user sees it in the preview.
  // No cloning, no off-screen tricks — what you see is what you get.
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

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

  const contentWidth = pageWidth - margin * 2
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
