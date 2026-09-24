import sanitizeHtml from 'sanitize-html';

/** Pindahan 1:1 dari my-app/lib/sanitize.ts. Dipanggil di service sebelum simpan DB. */
export function cleanContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote'],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h2', 'h3', 'h4', 'blockquote', 'img', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tag, attribs) => ({
        tagName: tag,
        attribs: { ...attribs, rel: 'noopener noreferrer', target: '_blank' },
      }),
    },
  });
}
