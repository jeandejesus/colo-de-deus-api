import { Controller, Get, Logger } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  check() {
    try {
      this.logger.log('API funcionando normalmente!', new Date());

      return {
        status: 'ok',
        timestamp: new Date(),
        message: 'API funcionando normalmente!',
      };
    } catch (error) {
      this.logger.log('API funcionando normalmente!', error);
    }
  }
}
