import { RestaurantModule } from '@app/restaurant';
import { UtilModule } from '@app/util';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, MenuCategory, Option } from './entity';
import { MenuService } from './menu.service';

@Module({
  imports: [
    UtilModule,
    forwardRef(() => RestaurantModule),
    TypeOrmModule.forFeature([Menu, MenuCategory, Option]),
  ],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {
}
