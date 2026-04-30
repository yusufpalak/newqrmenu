import {  IsString, IsNotEmpty, IsOptional, IsEnum  } from 'class-validator';

export class CreateTranslationRequestDto {
  @IsString()
  @IsNotEmpty()
  targetLocale;

  @IsEnum(['CATEGORY', 'SUBCATEGORY', 'PRODUCT', 'FULL_MENU'])
  entityType;

  @IsString()
  @IsOptional()
  entityId;

  @IsString()
  @IsOptional()
  note;
}
