import { AuthModule } from '@app/auth';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { RestaurantModule } from '@app/restaurant';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { RestaurantMenuController } from './restaurant-menu.controller';
import { UserMenuController } from './user-menu.controller';

@Module({
  controllers: [RestaurantMenuController, UserMenuController],
  exports: [MenuService],
  imports: [
    AuthModule, RestaurantModule,
    TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
    TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
    UtilModule,
  ],
  providers: [MenuService],
})
export class MenuModule {
}
