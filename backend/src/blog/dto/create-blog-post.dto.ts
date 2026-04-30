import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  IsArray,
  ValidateNested,
  Matches,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

const LOCALES = ['tr', 'en', 'es', 'ru', 'de', 'fr', 'it'] as const;

export class BlogTranslationDto {
  @IsString()
  @IsIn(LOCALES as unknown as string[])
  locale!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @Length(1, 220)
  slug?: string;

  @IsString()
  @Length(1, 255)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  excerpt?: string | null;

  @IsString()
  @Length(1, 200000)
  content!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  metaTitle?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  metaDescription?: string | null;
}

export class CreateBlogPostDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @Length(1, 200)
  slug?: string;

  @IsString()
  @IsIn(LOCALES as unknown as string[])
  sourceLocale!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1024)
  coverImage?: string | null;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  tags?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  /** If true, server auto-translates the source-locale fields to all other locales. */
  @IsOptional()
  @IsBoolean()
  autoTranslate?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogTranslationDto)
  translations!: BlogTranslationDto[];
}
