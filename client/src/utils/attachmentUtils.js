/**
 * Utility helpers for task attachments: URLs, MIME types, file sizes.
 */

/**
 * Resolves the full URL for an attachment file.
 * Handles both relative local paths (/uploads/...) and external URLs (e.g. Cloudinary).
 */
export function getAttachmentUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverOrigin = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${serverOrigin}${cleanPath}`;
}

/**
 * Checks whether an attachment is an image (PNG, JPG, WebP, GIF, SVG).
 */
export function isImageAttachment(att) {
  if (!att) return false;
  if (att.mimeType && att.mimeType.startsWith('image/')) return true;
  const target = att.url || att.filename || '';
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(target);
}

/**
 * Checks whether an attachment is a PDF.
 */
export function isPdfAttachment(att) {
  if (!att) return false;
  if (att.mimeType === 'application/pdf') return true;
  const target = att.url || att.filename || '';
  return /\.pdf$/i.test(target);
}

/**
 * Human-readable file size formatter.
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
