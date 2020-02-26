import { Coupon, Group, Menu, MenuCategory, Option, Order, Restaurant, User } from './entity';
import { ConfigModule } from '@app/config';
import { DBService } from './db.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';

@Module({
  exports: [DBService],
  imports: [
    UtilModule, ConfigModule,
    TypeOrmModule.forFeature([
      Coupon, Group, Menu, MenuCategory, Option, Order, Restaurant, User,
    ]),
  ],
  providers: [DBService],
})
export class DBModule {
}
