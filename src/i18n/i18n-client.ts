import translationsData from './translations.json';

export type SupportedLang = 'en' | 'zh' | 'es' | 'fr' | 'de';

export const SUPPORTED_LANGS: { code: SupportedLang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh', label: '简体中文', short: '中文' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
];

const translations: Record<SupportedLang, Record<string, string>> = translationsData as any;

/**
 * 1. Check User Manual Preference from localStorage
 */
export function getSavedLang(): SupportedLang | null {
  try {
    const saved = localStorage.getItem('aura_preferred_lang');
    if (saved && ['en', 'zh', 'es', 'fr', 'de'].includes(saved)) {
      return saved as SupportedLang;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

/**
 * 2. Detect Language from Browser (Browser > IP)
 */
export function detectBrowserLang(): SupportedLang | null {
  if (typeof navigator === 'undefined') return null;

  const languages = navigator.languages || [navigator.language];
  for (const rawLang of languages) {
    if (!rawLang) continue;
    const l = rawLang.toLowerCase();
    if (l.startsWith('zh')) return 'zh';
    if (l.startsWith('es')) return 'es';
    if (l.startsWith('fr')) return 'fr';
    if (l.startsWith('de')) return 'de';
    if (l.startsWith('en')) return 'en';
  }
  return null;
}

/**
 * 3. Detect Language from IP Geolocation (Fallback)
 */
export async function detectIpLang(): Promise<SupportedLang | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout

    const res = await fetch('https://api.country.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const country = (data.country || '').toUpperCase();

      // Country to Language Mapping
      if (['CN', 'HK', 'TW', 'MO'].includes(country)) return 'zh';
      if (['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'BO'].includes(country)) return 'es';
      if (['FR', 'BE', 'MC', 'LU', 'CH'].includes(country)) return 'fr';
      if (['DE', 'AT', 'LI'].includes(country)) return 'de';
      return 'en';
    }
  } catch {
    // Graceful fallback on network error or abort
  }
  return null;
}

/**
 * Resolve Target Language with strict priority:
 * 1. User manual selection
 * 2. Browser language (Browser > IP)
 * 3. IP geolocation
 * 4. Default: 'zh' if navigator matches or 'en'
 */
export async function resolveLanguage(): Promise<SupportedLang> {
  // Priority 1: User choice
  const userLang = getSavedLang();
  if (userLang) return userLang;

  // Priority 2: Browser language (Browser > IP)
  const browserLang = detectBrowserLang();
  if (browserLang) return browserLang;

  // Priority 3: IP detection
  const ipLang = await detectIpLang();
  if (ipLang) return ipLang;

  // Default fallback
  return 'en';
}

/**
 * Apply translations to DOM elements
 */
export function applyTranslations(lang: SupportedLang) {
  if (typeof document === 'undefined') return;

  const dict = translations[lang] || translations.en;
  document.documentElement.lang = lang;

  // 1. Text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && dict[key]) {
      el.textContent = dict[key];
    }
  });

  // 2. Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && dict[key]) {
      (el as HTMLInputElement).placeholder = dict[key];
    }
  });

  // 3. Value attributes
  document.querySelectorAll('[data-i18n-value]').forEach((el) => {
    const key = el.getAttribute('data-i18n-value');
    if (key && dict[key]) {
      (el as HTMLInputElement).value = dict[key];
    }
  });

  // 4. Dynamic dual-language attributes (data-zh vs data-en)
  document.querySelectorAll('[data-zh]').forEach((el) => {
    const isZh = lang === 'zh';
    const targetText = isZh ? el.getAttribute('data-zh') : el.getAttribute('data-en');
    if (targetText !== null && targetText !== undefined) {
      el.textContent = targetText;
    }
  });

  // Update switcher labels in UI
  const currentLangObj = SUPPORTED_LANGS.find(l => l.code === lang) || SUPPORTED_LANGS[0];
  document.querySelectorAll('.current-lang-label').forEach((el) => {
    el.textContent = currentLangObj.short;
  });

  // Dispatch custom event for reactive components
  window.dispatchEvent(new CustomEvent('aura-language-changed', {
    detail: { lang, dict }
  }));
}

/**
 * Public function to switch language
 */
export function setLanguage(lang: SupportedLang) {
  try {
    localStorage.setItem('aura_preferred_lang', lang);
  } catch {}
  applyTranslations(lang);
}

// Global hook on window object for inline HTML scripts
if (typeof window !== 'undefined') {
  (window as any).setAuraLang = setLanguage;
  (window as any).getAuraLang = () => document.documentElement.lang || 'en';
  (window as any).auraTranslations = translations;
}
