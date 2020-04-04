import { mongodb_entities, mysql_entities } from '@app/entity';
import { Module } from '@nestjs/common';
import { RestaurantModule } from '@app/restaurant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UtilModule } from '@app/util';

@Module({
  controllers: [UserController],
  exports: [UserService],
  imports: [
    RestaurantModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [UserService],
})
export class UserModule {
}
