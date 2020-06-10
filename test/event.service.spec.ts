import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { Event, mongodbEntities, mysqlEntities } from '@app/entity';
import { EventModule, EventService } from '@app/event';
import { RestaurantModule } from '@app/restaurant';
import { DtoUploadEvent, ResGetEventList } from '@app/type';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('EventService', () => {
  let event_service: EventService;
  const test_event: DtoUploadEvent = {
    banner_image: 'image.url', main_image: 'url.image',
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule, EventModule, RestaurantModule,
        TypeOrmModule.forRoot(config.mysql_config),
        TypeOrmModule.forRoot(config.mongodb_config),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UtilModule,
      ],
      providers: [EventService],
    }).compile();

    event_service = module.get<EventService>(EventService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadEvent', async () => {
    await event_service.upload(test_event);

    const [found_event]: ResGetEventList[] = await event_service.getList();
    expect(test_event).toEqual(found_event);

    const { e_id }: Event = await event_service.get();
    await event_service.remove(e_id);
  });
});
