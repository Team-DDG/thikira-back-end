import { mongodb_entities, mysql_entities } from '@app/entity';
import { MenuService } from './menu.service';
import { Module } from '@nestjs/common';
import { RestaurantMenuController } from './restaurant-menu.controller';
import { RestaurantModule } from '@app/restaurant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMenuController } from './user-menu.controller';
import { UtilModule } from '@app/util';

@Module({
  controllers: [RestaurantMenuController, UserMenuController],
  exports: [MenuService],
  imports: [
    RestaurantModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [MenuService],
})
export class MenuModule {
}
