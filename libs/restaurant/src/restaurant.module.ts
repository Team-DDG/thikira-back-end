import { MenuModule } from '@app/menu';
import { UtilModule } from '@app/util';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Module({
  exports: [RestaurantService],
  imports: [
    UtilModule,
    forwardRef(() => MenuModule),
    TypeOrmModule.forFeature([Restaurant]),
  ],
  providers: [RestaurantService],
})
export class RestaurantModule {
}
