import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';

export class ProductTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;
}

export class ProductPriceDto {
  @IsUUID()
  currencyId!: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  discountedPrice?: number;
}

export class ProductNutritionDto {
  @IsOptional() @IsNumber() calories?: number;
  @IsOptional() @IsNumber() protein?: number;
  @IsOptional() @IsNumber() carbohydrate?: number;
  @IsOptional() @IsNumber() fat?: number;
  @IsOptional() @IsNumber() sugar?: number;
  @IsOptional() @IsNumber() salt?: number;
  @IsOptional() @IsString() allergens?: string;
  @IsOptional() @IsString() ingredients?: string;
}

export class CreateProductDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceDto)
  prices?: ProductPriceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations?: ProductTranslationDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductNutritionDto)
  nutrition?: ProductNutritionDto;
}
