import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 8)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 8)
  symbol!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
