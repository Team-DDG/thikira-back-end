import { Coupon, Group, Menu, MenuCategory, Option, Restaurant, User } from './entity';
import { ConfigModule } from '@app/config';
import { DBService } from './db.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';

export const mysql_entities = [
  Coupon, Group, Menu, MenuCategory, Option, Restaurant, User,
];

@Module({
  exports: [DBService],
  imports: [
    UtilModule, ConfigModule,
    TypeOrmModule.forFeature(mysql_entities),
  ],
  providers: [DBService],
})
export class DBModule {
}
