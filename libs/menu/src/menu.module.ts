import { RestaurantModule } from '@app/restaurant';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, MenuCategory, Option } from './entity';
import { MenuService } from './menu.service';

@Module({
  imports: [
    forwardRef(() => RestaurantModule),
    TypeOrmModule.forFeature([Menu, MenuCategory, Option]),
  ],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {
}
