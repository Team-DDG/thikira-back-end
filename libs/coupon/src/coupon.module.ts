import { mongodb_entities, mysql_entities } from '@app/entity';
import { CouponService } from './coupon.service';
import { Module } from '@nestjs/common';
import { RestaurantCouponController } from './restaurant-coupon.controller';
import { RestaurantModule } from '@app/restaurant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCouponController } from './user-coupon.controller';
import { UserModule } from '@app/user';
import { UtilModule } from '@app/util';

@Module({
  controllers: [RestaurantCouponController, UserCouponController],
  exports: [CouponService],
  imports: [
    RestaurantModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UserModule, UtilModule,
  ],
  providers: [CouponService],
})
export class CouponModule {

}
