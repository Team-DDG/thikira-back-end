import { DBModule, mongodb_entities, mysql_entities } from '@app/db';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';

@Module({
  exports: [OrderService],
  imports: [
    DBModule,
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule],
  providers: [OrderService],
})
export class OrderModule {

}
