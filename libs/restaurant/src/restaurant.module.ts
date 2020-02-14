import { DBModule } from '@app/db';
import { DtoModule } from '@app/dto';
import { ResModule } from '@app/res';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [UtilModule, DBModule, DtoModule, ResModule],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {
}
