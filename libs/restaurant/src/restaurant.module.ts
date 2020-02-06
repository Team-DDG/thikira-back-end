import { DBModule } from '@app/db';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [UtilModule, DBModule],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {
}
