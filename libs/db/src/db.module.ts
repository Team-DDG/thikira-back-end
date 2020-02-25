import { ConfigModule } from '@app/config';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DBService } from './db.service';
import { Group, Menu, MenuCategory, Option, Restaurant, User } from './entity';

@Module({
  imports: [
    UtilModule, ConfigModule,
    TypeOrmModule.forFeature([Restaurant, User, Menu, MenuCategory, Option, Group]),
  ],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {
}
