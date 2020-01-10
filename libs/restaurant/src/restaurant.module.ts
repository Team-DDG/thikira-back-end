import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';

@Module({
  providers: [RestaurantService],
  controllers: [RestaurantController],
  exports: [RestaurantService],
})
export class RestaurantModule {}
