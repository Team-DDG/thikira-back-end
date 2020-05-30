import { AuthModule } from '@app/auth';
import { mysqlEntities, mongodbEntities } from '@app/entity';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';

@Module({
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
