// Localized strings for the marketing/home page across all supported locales.
// Each language's copy lives in frontend/locales/home/<code>.json.

import trJson from '~/locales/home/tr.json';
import enJson from '~/locales/home/en.json';
import esJson from '~/locales/home/es.json';
import ruJson from '~/locales/home/ru.json';
import deJson from '~/locales/home/de.json';
import frJson from '~/locales/home/fr.json';
import itJson from '~/locales/home/it.json';

export type HomeLocale = 'tr' | 'en' | 'es' | 'ru' | 'de' | 'fr' | 'it';

export const HOME_LOCALES: HomeLocale[] = ['tr', 'en', 'es', 'ru', 'de', 'fr', 'it'];

export interface IHomeStrings {
  htmlLang: string;
  ogLocale: string;
  metaTitle: string;
  metaDescription: string;
  brand: string;
  nav: { login: string; about: string; contact: string; blog: string };
  languageLabel: string;
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  cta: { title: string; subtitle: string; primary: string; secondary: string };
  footer: { rights: string };
  languageNames: Record<HomeLocale, string>;
}

/** Native language names shown in the language switcher dropdown. */
const LANGUAGE_NATIVE: Record<HomeLocale, string> = {
  tr: 'Türkçe',
  en: 'English',
  es: 'Español',
  ru: 'Русский',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
};

type IHomeStringsSource = Omit<IHomeStrings, 'languageNames'>;

const withNames = (src: IHomeStringsSource): IHomeStrings => ({
  ...src,
  languageNames: LANGUAGE_NATIVE,
});

const HOME_I18N: Record<HomeLocale, IHomeStrings> = {
  tr: withNames(trJson as IHomeStringsSource),
  en: withNames(enJson as IHomeStringsSource),
  es: withNames(esJson as IHomeStringsSource),
  ru: withNames(ruJson as IHomeStringsSource),
  de: withNames(deJson as IHomeStringsSource),
  fr: withNames(frJson as IHomeStringsSource),
  it: withNames(itJson as IHomeStringsSource),
};

export const isHomeLocale = (value: string | undefined | null): value is HomeLocale =>
  !!value && (HOME_LOCALES as string[]).includes(value);

export const detectBrowserHomeLocale = (): HomeLocale => {
  if (typeof navigator === 'undefined') return 'tr';
  const candidates = [navigator.language, ...(navigator.languages || [])];
  for (const c of candidates) {
    const code = c?.slice(0, 2).toLowerCase();
    if (isHomeLocale(code)) return code;
  }
  return 'tr';
};

export const useHomeI18n = (locale: HomeLocale): IHomeStrings => HOME_I18N[locale];
