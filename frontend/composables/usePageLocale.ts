// Helper for SSR-safe locale resolution from ?lang= query on /about, /contact, /blog pages.
import type { ComputedRef } from 'vue';
import { HOME_LOCALES, type HomeLocale } from './useHomeI18n';

export const SITE_URL = 'http://localhost:3003';

const isHomeLocale = (v: unknown): v is HomeLocale =>
  typeof v === 'string' && (HOME_LOCALES as readonly string[]).includes(v);

export function usePageLocale(): { lang: ComputedRef<HomeLocale> } {
  const route = useRoute();
  const lang = computed<HomeLocale>(() => {
    const q = route.query.lang;
    const v = Array.isArray(q) ? q[0] : q;
    return isHomeLocale(v) ? v : 'tr';
  });
  return { lang };
}

export const localizedPath = (path: string, lang: HomeLocale): string =>
  lang === 'tr' ? path : `${path}?lang=${lang}`;

export const buildHreflangAlternates = (
  basePath: string,
): { rel: string; hreflang: string; href: string }[] =>
  HOME_LOCALES.map((code) => ({
    rel: 'alternate',
    hreflang: code,
    href: `${SITE_URL}${localizedPath(basePath, code)}`,
  }));

export const buildCanonical = (basePath: string, lang: HomeLocale): string =>
  `${SITE_URL}${localizedPath(basePath, lang)}`;
