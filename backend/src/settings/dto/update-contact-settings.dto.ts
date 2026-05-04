import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactSettingsDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactAddress?: string;
}
