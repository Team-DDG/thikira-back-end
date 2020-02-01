import { MenuModule } from '@app/menu';
import { UtilModule } from '@app/util';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';

@Module({
  exports: [RestaurantService],
  imports: [
    UtilModule,
    forwardRef(() => MenuModule),
    TypeOrmModule.forFeature([Restaurant]),
  ],
  providers: [RestaurantService],
  controllers: [RestaurantController],
})
export class RestaurantModule {
}
