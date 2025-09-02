// src/users/dto/create-user.dto.ts

import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../schemas/user.schema';
import { VocationalYear } from 'src/enums/VocationalYearEnum.enum';

// DTO para o subdocumento de endereço
export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  // Use um regex para validar a senha
  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  birthDate!: string; // Mantenha como string para validação inicial, converta para Date no serviço

  @IsString()
  @IsNotEmpty()
  phone!: string;

  // Usa @ValidateNested e @Type para validar o DTO aninhado
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;

  @IsEnum(VocationalYear)
  @IsNotEmpty()
  vocationalYear!: VocationalYear;

  @IsString()
  @IsNotEmpty()
  trainer!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  monthlyContributionDay?: number;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
