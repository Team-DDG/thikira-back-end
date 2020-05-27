import { config } from '@app/config';
import { CouponModule } from '@app/coupon';
import { mongodb_entities, mysql_entities } from '@app/entity';
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
    CouponModule, MenuModule, OrderModule, RestaurantModule, ReviewModule,
    TypeOrmModule.forRoot({
      ...config.mysql_config,
      entities: mysql_entities,
    }),
    TypeOrmModule.forRoot({
      ...config.mongodb_config,
      entities: mongodb_entities,
    }),
    UserModule, UtilModule,
  ],
})
export class AppModule {
}
