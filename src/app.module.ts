import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import { RestaurantController, RestaurantMenuController, UserController, UserMenuController } from './controller';
import { UtilModule, UtilService } from '@app/util';
import { APP_GUARD } from '@nestjs/core';
import { AppGuard } from './app.guard';
import { MenuModule } from '@app/menu';
import { Module } from '@nestjs/common';
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
    UtilModule, DBModule, ReqModule, ResModule,
    RestaurantModule, UserModule, MenuModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          ...config.orm_config,
          entities: [Restaurant, User, Menu, MenuCategory, Option, Group],
        };
      },
    })],
  providers: [{
    inject: [UtilService],
    provide: APP_GUARD,
    useClass: AppGuard,
  }],
})
export class AppModule {
}
