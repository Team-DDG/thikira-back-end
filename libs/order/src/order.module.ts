import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { TypeModule } from '@app/type';
import { UtilModule } from '@app/util';

@Module({
  exports: [OrderService],
  imports: [DBModule, TypeModule, UtilModule],
  providers: [OrderService],
})
export class OrderModule {

}
