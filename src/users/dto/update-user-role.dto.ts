// src/users/dto/update-user-role.dto.ts

import { IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Papel de usuário inválido.' })
  role!: UserRole;
}
