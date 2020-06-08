import { AuthModule } from '@app/auth';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { RestaurantEventController } from './restaurant-event.controller';
import { UserEventController } from './user-coupon.controller';

@Module({
  controllers: [RestaurantEventController, UserEventController],
  exports: [EventService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
    TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
    UtilModule,
  ],
  providers: [EventService],
})
export class EventModule {
}
