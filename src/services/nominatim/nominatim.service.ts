import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NominatimService {
  private readonly googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

  /**
   * Busca coordenadas de um endereço com fallback automático:
   * - 1ª tentativa: Google Geocoding API
   * - 2ª tentativa: Nominatim (OpenStreetMap)
   */
  async getCoordinates(
    address: string,
  ): Promise<{ lat: number; lon: number } | null> {
    if (!address) return null;

    console.log(`Buscando coordenadas para: "${address}"`);

    // --- 1️⃣ Tentar Google Maps ---
    try {
      console.log('Tentando Google Maps API...');
      if (!this.googleApiKey) {
        console.log('❌ Chave da API do Google não configurada.');
        throw new Error('Chave da API do Google não configurada.');
      }
      const googleUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
      const googleResponse = await axios.get(googleUrl, {
        params: {
          address,
          key: this.googleApiKey,
        },
      });

      const gData = googleResponse.data;
      if (gData.status === 'OK' && gData.results.length > 0) {
        const loc = gData.results[0].geometry.location;
        console.log(`✅ Coordenadas (Google): ${loc.lat}, ${loc.lng}`);
        return { lat: loc.lat, lon: loc.lng };
      }

      console.log(
        `Google não retornou resultados (${gData.status}) — tentando Nominatim...`,
      );
    } catch (err) {
      console.log(`❌ Erro no Google: ${err.message}`);
    }

    // --- 2️⃣ Fallback: Nominatim ---
    try {
      const osmUrl = 'https://nominatim.openstreetmap.org/search';
      const osmResponse = await axios.get(osmUrl, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
        headers: {
          'User-Agent': 'ColoDeDeusCWB/1.0 (mission@colodedeus.com.br)',
        },
      });

      const oData = osmResponse.data;
      if (oData && oData.length > 0) {
        const { lat, lon } = oData[0];
        console.log(`✅ Coordenadas (Nominatim): ${lat}, ${lon}`);
        return {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
        };
      }

      console.log('Nominatim também não encontrou resultados.');
      return null;
    } catch (err) {
      console.log(`❌ Erro no Nominatim: ${err.message}`);
      return null;
    }
  }
}
