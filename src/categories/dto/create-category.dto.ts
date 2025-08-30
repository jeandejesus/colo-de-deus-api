import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryType } from '../schema/category.schema';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'O nome da categoria não pode ser vazio.' })
  @IsString({ message: 'O nome da categoria deve ser um texto.' })
  name!: string;

  @IsNotEmpty({ message: 'O tipo da categoria não pode ser vazio.' })
  @IsEnum(CategoryType)
  type!: CategoryType;
}
