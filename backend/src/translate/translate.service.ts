import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Locale codes supported by the QR Menu marketing/blog UI.
 * Matches the home-page i18n locale set.
 */
export type SupportedLocale = 'tr' | 'en' | 'es' | 'ru' | 'de' | 'fr' | 'it';

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  'tr',
  'en',
  'es',
  'ru',
  'de',
  'fr',
  'it',
];

/** Map our locale code to a Google Translate target language code. */
const GOOGLE_TARGET_MAP: Record<SupportedLocale, string> = {
  tr: 'tr',
  en: 'en',
  es: 'es',
  ru: 'ru',
  de: 'de',
  fr: 'fr',
  it: 'it',
};

/** Map our locale code to a Google Translate source language code. */
const GOOGLE_SOURCE_MAP: Record<SupportedLocale, string> = {
  tr: 'tr',
  en: 'en',
  es: 'es',
  ru: 'ru',
  de: 'de',
  fr: 'fr',
  it: 'it',
};

export interface IGoogleTranslateResponse {
  data: {
    translations: { translatedText: string }[];
  };
}

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);

  private get apiUrl(): string {
    return process.env.GOOGLE_TRANSLATE_API_URL || 'https://translation.googleapis.com/language/translate/v2';
  }

  private get apiKey(): string | undefined {
    return process.env.GOOGLE_TRANSLATE_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Translate a single string from `source` locale to `target` locale via Google Translate.
   * Returns the original text if the API key is missing (graceful degradation).
   */
  async translateText(
    text: string,
    source: SupportedLocale,
    target: SupportedLocale,
  ): Promise<string> {
    if (!text || !text.trim()) return text;
    if (source === target) return text;
    if (!this.apiKey) {
      this.logger.warn('GOOGLE_TRANSLATE_API_KEY missing — returning source text as-is.');
      return text;
    }

    const url = `${this.apiUrl}?key=${this.apiKey}`;
    const body = {
      q: text,
      source: GOOGLE_SOURCE_MAP[source],
      target: GOOGLE_TARGET_MAP[target],
      format: 'text',
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        this.logger.error(`Google Translate ${res.status}: ${detail}`);
        throw new InternalServerErrorException(
          `Translation failed (${res.status})`,
        );
      }
      const data = (await res.json()) as IGoogleTranslateResponse;
      return data.data.translations?.[0]?.translatedText ?? text;
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error('Google Translate request failed', err as Error);
      throw new InternalServerErrorException('Translation API unreachable');
    }
  }

  /**
   * Translate a record of named string fields from `source` to `target`.
   * Empty / null fields are passed through untouched.
   */
  async translateFields<K extends string>(
    fields: Record<K, string | null | undefined>,
    source: SupportedLocale,
    target: SupportedLocale,
  ): Promise<Record<K, string | null>> {
    const out = {} as Record<K, string | null>;
    for (const key of Object.keys(fields) as K[]) {
      const v = fields[key];
      if (v === null || v === undefined || v === '') {
        out[key] = v ?? null;
        continue;
      }
      out[key] = await this.translateText(v, source, target);
    }
    return out;
  }

  /**
   * Translate a record of fields into every supported locale (excluding source).
   * Returns a map keyed by locale.
   */
  async translateToAllLocales<K extends string>(
    fields: Record<K, string | null | undefined>,
    source: SupportedLocale,
    extraLocales?: SupportedLocale[],
  ): Promise<Record<SupportedLocale, Record<K, string | null>>> {
    const targets = (extraLocales ?? SUPPORTED_LOCALES).filter(
      (l) => l !== source,
    );
    const result: Record<string, Record<K, string | null>> = {};
    for (const target of targets) {
      result[target] = await this.translateFields(fields, source, target);
    }
    // include source as-is
    result[source] = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, (v as string) ?? null]),
    ) as Record<K, string | null>;
    return result as Record<SupportedLocale, Record<K, string | null>>;
  }

  assertSupported(locale: string): SupportedLocale {
    if (!(SUPPORTED_LOCALES as string[]).includes(locale)) {
      throw new BadRequestException(`Unsupported locale: ${locale}`);
    }
    return locale as SupportedLocale;
  }
}
