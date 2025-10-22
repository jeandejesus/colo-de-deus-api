import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsObject,
  ValidateNested,
  IsNumber,
  IsOptional,
  Max,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VocationalYear } from 'src/enums/VocationalYearEnum.enum';

export class LocationDto {
  @IsOptional()
  @IsString({ message: 'O tipo deve ser uma string' })
  type?: 'Point';

  @IsOptional()
  @IsNumber({}, { each: true, message: 'As coordenadas devem ser números' })
  @Type(() => Number)
  coordinates?: [number, number]; // [longitude, latitude]
}

// DTO de Endereço (se não estiver em um arquivo separado)
export class AddressDto {
  @IsString({ message: 'A rua deve ser uma string' })
  @IsNotEmpty({ message: 'A rua não pode ser vazia' })
  street!: string;

  @IsString({ message: 'O bairro deve ser uma string' })
  @IsNotEmpty({ message: 'O bairro não pode ser vazio' })
  neighborhood!: string;

  @IsString({ message: 'A cidade deve ser uma string' })
  @IsNotEmpty({ message: 'A cidade não pode ser vazia' })
  city!: string;

  @IsString({ message: 'O estado deve ser uma string' })
  @IsNotEmpty({ message: 'O estado não pode ser vazio' })
  state!: string;

  @IsOptional()
  @IsObject({ message: 'A localização deve ser um objeto' })
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class RegisterUserDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'O e-mail não pode ser vazio' })
  email!: string;

  @IsNotEmpty({ message: 'A senha não pode ser vazia' })
  @IsString({ message: 'A senha deve ser uma string' })
  password!: string;

  @IsNotEmpty({ message: 'O nome não pode ser vazio' })
  @IsString({ message: 'O nome deve ser uma string' })
  name!: string;

  @IsDateString({}, { message: 'A data de nascimento deve ser uma data válida' })
  @IsNotEmpty({ message: 'A data de nascimento não pode ser vazia' })
  birthDate!: string;

  @IsString({ message: 'O telefone deve ser uma string' })
  @IsNotEmpty({ message: 'O telefone não pode ser vazio' })
  phone!: string;

  @IsObject({ message: 'O endereço deve ser um objeto válido.' })
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @IsNotEmpty({ message: 'O ano vocacional não pode ser vazio' })
  @IsEnum(VocationalYear, { message: 'Ano vocacional inválido' })
  vocationalYear!: VocationalYear;

  @IsOptional()
  @IsNumber({}, { message: 'O dia da contribuição deve ser um número.' })
  @Min(1, { message: 'O dia deve ser no mínimo 1.' })
  @Max(31, { message: 'O dia deve ser no máximo 31.' })
  monthlyContributionDay?: number;

  @IsNotEmpty({ message: 'O Formador não pode ser vazio' })
  @IsString({ message: 'O Formador deve ser uma string' })
  trainer!: string;
}
