import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsIn,
} from 'class-validator';

const LOCALES = ['tr', 'en', 'es', 'ru', 'de', 'fr', 'it'] as const;

export class CreateContactMessageDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEmail()
  @Length(3, 255)
  email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+0-9\s\-()]{6,30}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  subject?: string;

  @IsString()
  @Length(5, 5000)
  message!: string;

  @IsOptional()
  @IsString()
  @IsIn(LOCALES as unknown as string[])
  locale?: string;
}
