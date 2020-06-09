import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { Event, mongodbEntities, mysqlEntities } from '@app/entity';
import { EventModule, EventService } from '@app/event';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { DtoCreateRestaurant, DtoUploadEvent, ResGetEventList } from '@app/type';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('EventService', () => {
  let event_service: EventService;
  let restaurant_service: RestaurantService;
  let restaurant_token: string;
  const test_event: DtoUploadEvent = {
    banner_image: 'image.url', main_image: 'url.image',
  };
  const test_restaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'eventTest',
    close_time: 'e',
    day_off: 'f',
    description: 'g',
    email: 'eventTest@gmail.com',
    image: 'image.url',
    min_price: 10000,
    name: 'eventTest',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    password: 'eventTest',
    phone: '01012345678',
    road_address: 'b',
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
    restaurant_service = module.get<RestaurantService>(RestaurantService);

    await restaurant_service.create(test_restaurant);
    ({ access_token: restaurant_token } = await restaurant_service.signIn({
      email: test_restaurant.email,
      password: test_restaurant.password,
    }));

  });

  afterAll(async () => {
    await restaurant_service.leave(restaurant_token);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadEvent', async () => {
    await event_service.upload(restaurant_token, test_event);

    const [found_event]: ResGetEventList[] = await event_service.getList();
    expect(test_event).toEqual(found_event);

    const { e_id }: Event = await event_service.get();
    await event_service.remove(e_id);
  });
});
