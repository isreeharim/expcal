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
  scale = 2
}: PDFOptions = {}) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Invoice container element not found')
  }

  // Create high-resolution canvas screenshot
  const canvas = await html2canvas(element, {
    scale: scale, // 2x or 3x for crisp text
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  })

  // Get image data
  const imgData = canvas.toDataURL('image/jpeg', 0.98)

  // Standard A4 dimensions in mm: 210mm x 297mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 10 // 10mm margins

  const contentWidth = pageWidth - margin * 2
  const contentHeight = (canvas.height * contentWidth) / canvas.width

  // If content fits on 1 page
  if (contentHeight <= pageHeight - margin * 2) {
    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight)
  } else {
    // Multi-page handling if invoice is long
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

  // Save the PDF file directly to user's device
  pdf.save(fileName)
  return true
}
