import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { IncomesModule } from 'src/incomes/incomes.module';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { EmailModule } from 'src/email/email.module';
import { NominatimService } from 'src/services/nominatim/nominatim.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    IncomesModule,
    CategoriesModule,
    forwardRef(() => EmailModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, CategoriesService, NominatimService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
