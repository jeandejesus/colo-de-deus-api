import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NominatimService } from 'src/services/nominatim/nominatim.service';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GeoUpdateService {
  private readonly streetPrefixes = ['Rua', 'Avenida', 'Travessa', 'Alameda', 'Praça'];

  constructor(
    private readonly nominatim: NominatimService,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateMissingCoordinates(manual = false) {
    console.log('🔄 Iniciando atualização de coordenadas de missionários...');

    let missionaries: User[];
    if (manual) {
      missionaries = await this.usersService.findAll();
      console.log(`🔍 Encontrados ${missionaries.length} missionários para atualização.`);
    } else {
      console.log('🟢 Atualização Cron disparada!');
      missionaries = await this.usersService.findWithoutCoordinates();
      console.log(`🔍 Encontrados ${missionaries.length} missionários sem coordenadas.`);
    }

    for (const user of missionaries) {
      let coords: { lat: number; lon: number } = { lat: 0, lon: 0 };

      for (const prefix of this.streetPrefixes) {
        const fullAddress = `${this.applyPrefix(user.address.street, prefix)}, ${user.address.city}, ${user.address.state}`;
        console.log(`Buscando coordenadas para: ${fullAddress}`);

        const result = await this.nominatim.getCoordinates(fullAddress);

        if (result && result.lat && result.lon) {
          coords = { lat: result.lat, lon: result.lon };
          await this.usersService.updateCoordinates(user._id.toString(), coords.lat, coords.lon);
          console.log(`✅ Atualizado: ${user.name} → (${coords.lat}, ${coords.lon})`);
          break; // sai do loop, encontrou
        }

        // Delay de 1s entre tentativas
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Se não encontrou coordenadas válidas
      if (!coords.lat || !coords.lon) {
        console.warn(
          `⚠️ Não foi possível encontrar coordenadas para: ${user.address.street}, ${user.address.city}, ${user.address.state}`,
        );
      }

      // Delay de 1s entre usuários
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('✨ Atualização de coordenadas concluída.');
  }

  private applyPrefix(street: string, prefix: string): string {
    const hasPrefix = this.streetPrefixes.some((p) => street.startsWith(p));
    return hasPrefix ? street : `${prefix} ${street}`;
  }
}
