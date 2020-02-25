import { DBModule } from '@app/db';
import { ReqModule } from '@app/req';
import { ResModule } from '@app/res';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [UtilModule, DBModule, ReqModule, ResModule],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {
}
