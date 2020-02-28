import { Coupon, Group, Menu, MenuCategory, Option, Order, Restaurant, User } from './entity';
import { ConfigModule } from '@app/config';
import { DBService } from './db.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';

export const mongodb_entities = [
  Order,
];

export const mysql_entities = [
  Coupon, Group, Menu, MenuCategory, Option, Restaurant, User,
];

@Module({
  exports: [DBService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [DBService],
})
export class DBModule {
}
