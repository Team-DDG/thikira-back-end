import { config } from '@app/config';
import { CouponModule } from '@app/coupon';
import { EventModule } from '@app/event';
import { MenuModule } from '@app/menu';
import { OrderModule } from '@app/order';
import { RestaurantModule } from '@app/restaurant';
import { ReviewModule } from '@app/review';
import { UserModule } from '@app/user';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CouponModule, EventModule, MenuModule,
    OrderModule, RestaurantModule, ReviewModule,
    TypeOrmModule.forRoot(config.mysqlConfig),
    TypeOrmModule.forRoot(config.mongodbConfig),
    UserModule, UtilModule,
  ],
})
export class AppModule {
}
