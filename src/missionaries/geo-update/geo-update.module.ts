import { Module } from '@nestjs/common';
import { GeoUpdateController } from './geo-update.controller';
import { GeoUpdateService } from './geo-update.service';
import { NominatimService } from 'src/services/nominatim/nominatim.service';
import { UsersService } from 'src/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { IncomesService } from 'src/incomes/incomes.service';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { IncomesModule } from 'src/incomes/incomes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    IncomesModule,
    CategoriesModule,
  ],
  controllers: [GeoUpdateController],
  providers: [GeoUpdateService, NominatimService, GeoUpdateService, UsersService],
  exports: [GeoUpdateService],
})
export class GeoUpdateModule {}
