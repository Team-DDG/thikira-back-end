import { AuthModule } from '@app/auth';
import { mongodbEntities, mysqlEntities } from '@app/entity';
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
    AuthModule,
    TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
    TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
    UserModule, UtilModule,
  ],
  providers: [OrderService],
})
export class OrderModule {
}
