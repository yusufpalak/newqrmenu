import {  IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum  } from 'class-validator';
import {  Role  } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password;

  @IsString()
  @IsNotEmpty()
  name;

  @IsEnum(Role)
  @IsOptional()
  role;

  @IsString()
  @IsOptional()
  tenantId;
}
