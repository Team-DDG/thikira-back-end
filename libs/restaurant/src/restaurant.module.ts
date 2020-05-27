import { mongodb_entities, mysql_entities } from '@app/entity';
import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';

@Module({
  controllers: [RestaurantController],
  exports: [RestaurantService],
  imports: [
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [RestaurantService],
})
export class RestaurantModule {
}
