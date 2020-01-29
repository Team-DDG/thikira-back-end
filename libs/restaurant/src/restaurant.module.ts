import { UserModule } from '@app/user';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
  ],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {
}
