import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { ReqModule } from '@app/req';
import { ResModule } from '@app/res';
import { RestaurantService } from './restaurant.service';
import { UtilModule } from '@app/util';

@Module({
  exports: [RestaurantService],
  imports: [DBModule, ReqModule, ResModule, UtilModule],
  providers: [RestaurantService],
})
export class RestaurantModule {
}
