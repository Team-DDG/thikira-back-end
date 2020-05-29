import { mongodb_entities, mysql_entities } from '@app/entity';
import { TokenModule } from '@app/token';
import { UserModule } from '@app/user';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { RestaurantOrderController } from './restaurant-order.controller';
import { UserOrderController } from './user-order.controller';

@Module({
  controllers: [RestaurantOrderController, UserOrderController],
  exports: [OrderService],
  imports: [
    TokenModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UserModule, UtilModule,
  ],
  providers: [OrderService],
})
export class OrderModule {
}
