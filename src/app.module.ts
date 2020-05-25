import { UtilModule, UtilService } from '@app/util';
import { mongodb_entities, mysql_entities } from '@app/entity';
import { APP_GUARD } from '@nestjs/core';
import { AppGuard } from './app.guard';
import { CouponModule } from '@app/coupon';
import { MenuModule } from '@app/menu';
import { Module } from '@nestjs/common';
import { OrderModule } from '@app/order';
import { RestaurantModule } from '@app/restaurant';
import { ReviewModule } from '@app/review';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@app/user';
import { config } from '@app/config';

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
  providers: [{
    inject: [UtilService],
    provide: APP_GUARD,
    useClass: AppGuard,
  }],
})
export class AppModule {
}
