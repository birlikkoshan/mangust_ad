/** Build full URL for static assets (e.g. category images) */
export function getAssetUrl(path: string | undefined): string | null {
  if (!path || !path.trim()) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = (import.meta as any).env?.VITE_API_URL || '';
  const origin = base.replace(/\/api\/v\d+\/?$/, '').replace(/\/$/, '');
  return origin + (path.startsWith('/') ? path : '/' + path);
}
