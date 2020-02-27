import { ConfigModule, config } from '@app/config';
import { DBModule, mysql_entities } from '@app/db';
import { RestaurantController, RestaurantMenuController, UserController, UserMenuController } from './controller';
import { UtilModule, UtilService } from '@app/util';
import { APP_GUARD } from '@nestjs/core';
import { AppGuard } from './app.guard';
import { CouponModule } from '@app/coupon';
import { MenuModule } from '@app/menu';
import { Module } from '@nestjs/common';
import { OrderModule } from '@app/order';
import { ReqModule } from '@app/req';
import { ResModule } from '@app/res';
import { RestaurantModule } from '@app/restaurant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@app/user';

@Module({
  controllers: [
    RestaurantController, RestaurantMenuController,
    UserController, UserMenuController,
  ],
  imports: [
    CouponModule, DBModule, MenuModule, OrderModule,
    ReqModule, ResModule, RestaurantModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory() {
        return { ...config.orm_config, entities: mysql_entities };
      },
    }), UserModule, UtilModule],
  providers: [{
    inject: [UtilService],
    provide: APP_GUARD,
    useClass: AppGuard,
  }],
})
export class AppModule {
}
