import { Group, Menu, MenuCategory, Option, Restaurant, User } from './entity';
import { ConfigModule } from '@app/config';
import { DBService } from './db.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';

@Module({
  exports: [DBService],
  imports: [
    UtilModule, ConfigModule,
    TypeOrmModule.forFeature([Restaurant, User, Menu, MenuCategory, Option, Group]),
  ],
  providers: [DBService],
})
export class DBModule {
}
