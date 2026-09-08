import site from '../data/site.json';

/**
 * Universal Asset URL Resolver.
 * Supports:
 * 1. Direct absolute URLs (e.g. Telegram CDN / Cloudflare Worker / third-party image host: https://...)
 * 2. Telegram CDN base prefix (configured in site.json `assetCdnUrl` or env `PUBLIC_ASSET_CDN`)
 * 3. Fallback to local static assets in /public
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  const trimmed = path.trim();

  // Already a full HTTP/HTTPS URL or Data URI -> return as-is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Check if a global CDN / Telegram reverse-proxy base is configured
  const envCdn = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.PUBLIC_ASSET_CDN as string) : undefined;
  const cdnBase = (envCdn || (site as any).assetCdnUrl || '').trim();

  if (cdnBase) {
    const cleanBase = cdnBase.replace(/\/+$/, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${cleanBase}${cleanPath}`;
  }

  // Default to local public path
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
