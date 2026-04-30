import {  IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested  } from 'class-validator';
import {  Type  } from 'class-transformer';

class TranslationDto {
  @IsString()
  locale;

  @IsString()
  @IsNotEmpty()
  name;

  @IsString()
  @IsOptional()
  description;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name;

  @IsString()
  @IsNotEmpty()
  slug;

  @IsString()
  @IsOptional()
  description;

  @IsString()
  @IsOptional()
  image;

  @IsInt()
  @IsOptional()
  sortOrder;

  @IsBoolean()
  @IsOptional()
  isActive;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  @IsOptional()
  translations;
}
