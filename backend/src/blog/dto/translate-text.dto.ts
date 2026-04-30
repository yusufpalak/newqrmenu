import { IsIn, IsString } from 'class-validator';

const LOCALES = ['tr', 'en', 'es', 'ru', 'de', 'fr', 'it'] as const;

/** Body for POST /blog/translate — translates a single text snippet. */
export class TranslateTextDto {
  @IsString()
  text!: string;

  @IsString()
  @IsIn(LOCALES as unknown as string[])
  source!: string;

  @IsString()
  @IsIn(LOCALES as unknown as string[])
  target!: string;
}
