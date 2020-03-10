import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { TypeModule } from '@app/type';
import { UtilModule } from '@app/util';

@Module({
  exports: [RestaurantService],
  imports: [DBModule, TypeModule, UtilModule],
  providers: [RestaurantService],
})
export class RestaurantModule {
}
