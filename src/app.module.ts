import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import { MenuModule } from '@app/menu';
import { RestaurantModule } from '@app/restaurant';
import { UserModule } from '@app/user';
import { UtilModule, UtilService } from '@app/util';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGuard } from './app.guard';

@Module({
  imports: [
    UtilModule, RestaurantModule, UserModule, MenuModule, DBModule,
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
