import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryType } from '../schema/category.schema';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  type!: CategoryType;
}
