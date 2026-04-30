import {  IsEmail, IsNotEmpty, IsString, MinLength  } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email;

  @IsString()
  @IsNotEmpty()
  password;
}
