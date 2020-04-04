import { mongodb_entities, mysql_entities } from '@app/entity';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { RestaurantOrderController } from './restaurant-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrderController } from './user-order.controller';
import { UtilModule } from '@app/util';

@Module({
  controllers: [RestaurantOrderController, UserOrderController],
  exports: [OrderService],
  imports: [
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [OrderService],
})
export class OrderModule {
}
