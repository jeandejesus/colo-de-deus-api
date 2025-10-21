import { Module } from '@nestjs/common';
import { LiturgiaService } from './liturgia.service';
import { LiturgiaController } from './liturgia.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Liturgia, LiturgiaSchema } from './schemas/liturgia.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Liturgia.name, schema: LiturgiaSchema }])],
  providers: [LiturgiaService],
  controllers: [LiturgiaController],
})
export class LiturgiaModule {}
