import { ConfigModule, ConfigService } from '@app/config';
import { Group, Menu, MenuCategory, MenuModule, Option } from '@app/menu';
import { Restaurant, RestaurantModule } from '@app/restaurant';
import { User, UserModule } from '@app/user';
import { UtilModule, UtilService } from '@app/util';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGuard } from './app.guard';

@Module({
  imports: [
    UtilModule, RestaurantModule, UserModule, MenuModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          ...config.orm_config,
          entities: [
            Restaurant, User, Menu, MenuCategory, Option, Group,
          ],
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
