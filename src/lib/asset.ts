/**
 * Ruta a un asset de /public respetando el basePath (§deploy).
 *
 * En export estatico sobre GitHub Pages, los <img>/background con ruta absoluta
 * NO reciben el basePath automaticamente (solo next/image lo hace). Este helper lo
 * antepone desde la env inyectada por el workflow. En local queda vacio.
 */
export function assetPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return `${base}${path}`;
}
