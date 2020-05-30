import { mongodbEntities, mysqlEntities } from '@app/entity';
import { TokenModule } from '@app/token';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';

@Module({
  controllers: [RestaurantController],
  exports: [RestaurantService],
  imports: [
    TokenModule,
    TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
    TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
    UtilModule,
  ],
  providers: [RestaurantService],
})
export class RestaurantModule {
}
