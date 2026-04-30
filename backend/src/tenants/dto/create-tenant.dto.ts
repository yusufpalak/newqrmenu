import {  IsString, IsNotEmpty, IsOptional, IsBoolean  } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name;

  @IsString()
  @IsNotEmpty()
  slug;

  @IsString()
  @IsOptional()
  logo;

  @IsString()
  @IsOptional()
  description;

  @IsString()
  @IsOptional()
  defaultLocale;

  @IsString()
  @IsOptional()
  defaultCurrencyId;

  @IsBoolean()
  @IsOptional()
  isActive;
}
