import { AuthModule } from '@app/auth';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { RestaurantModule } from '@app/restaurant';
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
    AuthModule, RestaurantModule,
    TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
    TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
    UtilModule,
  ],
  providers: [CouponService],
})
export class CouponModule {

}
