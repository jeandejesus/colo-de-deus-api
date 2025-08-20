import { IsEmail, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsDateString()
  birthDate!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsString()
  vocationalYear!: string;
}
