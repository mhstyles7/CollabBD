/**
 * Resolves avatar URLs that are stored as relative paths (e.g. /uploads/avatar-123.jpg)
 * to full URLs pointing to the backend server where the files are actually hosted.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // Already a full URL (e.g. Google OAuth avatar)
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Relative path like /uploads/avatar-123.jpg → prepend backend base
  return `${API_BASE}${path}`;
}
