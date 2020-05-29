import { mongodb_entities, mysql_entities } from '@app/entity';
import { RestaurantModule } from '@app/restaurant';
import { TokenModule } from '@app/token';
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
    RestaurantModule, TokenModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [MenuService],
})
export class MenuModule {
}
