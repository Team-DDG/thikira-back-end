import { mongodb_entities, mysql_entities } from '@app/entity';
import { RestaurantModule } from '@app/restaurant';
import { TokenModule } from '@app/token';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponService } from './coupon.service';
import { RestaurantCouponController } from './restaurant-coupon.controller';
import { UserCouponController } from './user-coupon.controller';

@Module({
  controllers: [RestaurantCouponController, UserCouponController],
  exports: [CouponService],
  imports: [
    RestaurantModule, TokenModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [CouponService],
})
export class CouponModule {

}
