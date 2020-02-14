import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import { DtoModule } from '@app/dto';
import { MenuModule } from '@app/menu';
import { ResModule } from '@app/res';
import { RestaurantModule } from '@app/restaurant';
import { UserModule } from '@app/user';
import { UtilModule, UtilService } from '@app/util';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGuard } from './app.guard';
import { RestaurantController, RestaurantMenuController, UserController } from './controller';

@Module({
  imports: [
    UtilModule, DBModule, DtoModule, ResModule,
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
  controllers: [RestaurantController, UserController, RestaurantMenuController],
})
export class AppModule {
}
