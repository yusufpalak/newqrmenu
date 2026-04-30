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

/** Map our locale code to a DeepL target language code. */
const DEEPL_TARGET_MAP: Record<SupportedLocale, string> = {
  tr: 'TR',
  en: 'EN-US',
  es: 'ES',
  ru: 'RU',
  de: 'DE',
  fr: 'FR',
  it: 'IT',
};

/** Map our locale code to a DeepL source language code. */
const DEEPL_SOURCE_MAP: Record<SupportedLocale, string> = {
  tr: 'TR',
  en: 'EN',
  es: 'ES',
  ru: 'RU',
  de: 'DE',
  fr: 'FR',
  it: 'IT',
};

export interface IDeepLResponse {
  translations: { detected_source_language: string; text: string }[];
}

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);

  private get apiUrl(): string {
    return process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
  }

  private get apiKey(): string | undefined {
    return process.env.DEEPL_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Translate a single string from `source` locale to `target` locale via DeepL.
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
      this.logger.warn('DEEPL_API_KEY missing — returning source text as-is.');
      return text;
    }

    const body = new URLSearchParams();
    body.append('text', text);
    body.append('source_lang', DEEPL_SOURCE_MAP[source]);
    body.append('target_lang', DEEPL_TARGET_MAP[target]);
    body.append('preserve_formatting', '1');
    body.append('tag_handling', 'html');

    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        this.logger.error(`DeepL ${res.status}: ${detail}`);
        throw new InternalServerErrorException(
          `Translation failed (${res.status})`,
        );
      }
      const data = (await res.json()) as IDeepLResponse;
      return data.translations?.[0]?.text ?? text;
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error('DeepL request failed', err as Error);
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
