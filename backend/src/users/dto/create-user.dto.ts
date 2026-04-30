import {  IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean  } from 'class-validator';
import {  Role  } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email;

  @IsString()
  @IsNotEmpty()
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

  @IsBoolean()
  @IsOptional()
  isActive;
}
