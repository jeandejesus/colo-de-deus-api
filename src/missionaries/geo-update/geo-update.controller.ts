// src/geo-update/geo-update.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { GeoUpdateService } from './geo-update.service';
import { AuthGuard } from '@nestjs/passport'; // opcional, se quiser proteger a rota
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('geo')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GeoUpdateController {
  constructor(private readonly geoService: GeoUpdateService) {}

  @Post('update')
  @SetMetadata('roles', [UserRole.ADMIN]) // apenas admin pode atualizar manualmente
  async updateCoordinatesManually() {
    console.log('🟢 Atualização manual de coordenadas disparada!');
    await this.geoService.updateMissingCoordinates(true);
    return {
      message: 'Atualização manual de coordenadas concluída. Confira os logs no servidor.',
    };
  }
}
