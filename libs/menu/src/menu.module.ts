import { RestaurantModule } from '@app/restaurant';
import { UtilModule } from '@app/util';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, Menu, MenuCategory, Option } from './entity';
import { MenuService } from './menu.service';

@Module({
  imports: [
    UtilModule,
    forwardRef(() => RestaurantModule),
    TypeOrmModule.forFeature([Menu, MenuCategory, Option, Group]),
  ],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {
}
