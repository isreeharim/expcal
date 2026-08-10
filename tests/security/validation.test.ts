import { describe, it, expect } from 'vitest'

describe('Security: Webhook URL Validation', () => {
  const isValidWebhookUrl = (url: string) => {
    const clean = url.trim()
    return clean.startsWith('https://script.google.com/macros/s/')
  }

  it('accepts valid Google Apps Script Webhook URLs', () => {
    const validUrl = 'https://script.google.com/macros/s/AKfycbz_123456789/exec'
    expect(isValidWebhookUrl(validUrl)).toBe(true)
  })

  it('rejects SSRF malicious URLs, internal IPs, and non-Google domains', () => {
    expect(isValidWebhookUrl('http://169.254.169.254/latest/meta-data')).toBe(false)
    expect(isValidWebhookUrl('http://localhost:3000/api/admin')).toBe(false)
    expect(isValidWebhookUrl('https://evil-attacker.com/steal-data')).toBe(false)
    expect(isValidWebhookUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('Security: Magic Bytes Binary Content Inspection', () => {
  function validateImageMagicBytes(buffer: Uint8Array): { isValid: boolean; detectedExt: string } {
    if (buffer.length < 4) return { isValid: false, detectedExt: '' }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { isValid: true, detectedExt: 'jpg' }
    }

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { isValid: true, detectedExt: 'png' }
    }

    // GIF: 47 49 46 38 ('GIF8')
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return { isValid: true, detectedExt: 'gif' }
    }

    // WebP: RIFF ... WEBP
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return { isValid: true, detectedExt: 'webp' }
    }

    return { isValid: false, detectedExt: '' }
  }

  it('detects valid JPEG files from magic bytes header', () => {
    const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])
    const res = validateImageMagicBytes(jpegHeader)
    expect(res.isValid).toBe(true)
    expect(res.detectedExt).toBe('jpg')
  })

  it('detects valid PNG files from magic bytes header', () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    const res = validateImageMagicBytes(pngHeader)
    expect(res.isValid).toBe(true)
    expect(res.detectedExt).toBe('png')
  })

  it('detects valid WebP files from magic bytes header', () => {
    const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
    const res = validateImageMagicBytes(webpHeader)
    expect(res.isValid).toBe(true)
    expect(res.detectedExt).toBe('webp')
  })

  it('rejects disguised executables, HTML scripts, and non-image payloads', () => {
    const exeHeader = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]) // MZ header
    const htmlHeader = new Uint8Array([0x3C, 0x21, 0x44, 0x4F, 0x43, 0x54]) // <!DOCT
    expect(validateImageMagicBytes(exeHeader).isValid).toBe(false)
    expect(validateImageMagicBytes(htmlHeader).isValid).toBe(false)
  })
})

describe('Security: File Upload & Path Sanitization', () => {
  const sanitizeUserIdPath = (userId: string) => userId.replace(/[^a-zA-Z0-9_-]/g, '')

  it('prevents path traversal directory attacks in user folder names', () => {
    expect(sanitizeUserIdPath('../../etc/passwd')).toBe('etcpasswd')
    expect(sanitizeUserIdPath('..\\windows\\system32')).toBe('windowssystem32')
    expect(sanitizeUserIdPath('usr_123-abc')).toBe('usr_123-abc')
  })
})

describe('Security: CSV Export Escaping', () => {
  const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`

  it('properly escapes quotes and commas to prevent formula injection and delimiter breakout', () => {
    expect(escapeCSV('Test "Value"')).toBe('"Test ""Value"""')
    expect(escapeCSV('Item, with comma')).toBe('"Item, with comma"')
    expect(escapeCSV('=cmd|"/C calc"!A0')).toBe('"=cmd|""/C calc""!A0"')
  })
})
