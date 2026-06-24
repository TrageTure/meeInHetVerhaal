import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'a', 'br']
const ALLOWED_ATTR = ['href', 'target', 'rel']

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function normalizeRichText(value = '') {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) return trimmed

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`)
    .join('')
}

export function sanitizeRichText(value = '') {
  return DOMPurify.sanitize(normalizeRichText(value), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })
}

export function isRichTextEmpty(value = '') {
  const plainText = sanitizeRichText(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .trim()

  return plainText.length === 0
}
