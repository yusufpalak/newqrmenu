import {  IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsNumber, IsArray, ValidateNested  } from 'class-validator';
import {  Type  } from 'class-transformer';

class PriceDto {
  @IsString()
  currencyId;

  @IsNumber()
  price;

  @IsNumber()
  @IsOptional()
  discountedPrice;
}

class NutritionDto {
  @IsNumber()
  @IsOptional()
  calories;

  @IsNumber()
  @IsOptional()
  protein;

  @IsNumber()
  @IsOptional()
  carbohydrate;

  @IsNumber()
  @IsOptional()
  fat;

  @IsNumber()
  @IsOptional()
  sugar;

  @IsNumber()
  @IsOptional()
  salt;

  @IsString()
  @IsOptional()
  allergens;

  @IsString()
  @IsOptional()
  ingredients;
}

class TranslationDto {
  @IsString()
  locale;

  @IsString()
  @IsNotEmpty()
  name;

  @IsString()
  @IsOptional()
  description;

  @IsString()
  @IsOptional()
  ingredients;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  categoryId;

  @IsString()
  @IsOptional()
  subCategoryId;

  @IsString()
  @IsNotEmpty()
  name;

  @IsString()
  @IsOptional()
  slug;

  @IsString()
  @IsOptional()
  description;

  @IsString()
  @IsOptional()
  image;

  @IsBoolean()
  @IsOptional()
  isActive;

  @IsBoolean()
  @IsOptional()
  isFeatured;

  @IsInt()
  @IsOptional()
  sortOrder;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceDto)
  @IsOptional()
  prices;

  @ValidateNested()
  @Type(() => NutritionDto)
  @IsOptional()
  nutrition;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  @IsOptional()
  translations;
}
