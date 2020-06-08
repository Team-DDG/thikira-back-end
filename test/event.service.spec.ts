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
  let eventService: EventService;
  let restaurantService: RestaurantService;
  let restaurantToken: string;
  const testEvent: DtoUploadEvent = {
    bannerImage: 'image.url', mainImage: 'url.image',
  };
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'eventTest',
    closeTime: 'element',
    dayOff: 'f',
    description: 'g',
    email: 'eventTest@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'eventTest',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'eventTest',
    phone: '01012345678',
    roadAddress: 'b',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule, EventModule, RestaurantModule,
        TypeOrmModule.forRoot(config.mysqlConfig),
        TypeOrmModule.forRoot(config.mongodbConfig),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UtilModule,
      ],
      providers: [EventService],
    }).compile();

    eventService = module.get<EventService>(EventService);
    restaurantService = module.get<RestaurantService>(RestaurantService);

    await restaurantService.create(testRestaurant);
    ({ accessToken: restaurantToken } = await restaurantService.signIn({
      email: testRestaurant.email,
      password: testRestaurant.password,
    }));

  });

  afterAll(async () => {
    await restaurantService.leave(restaurantToken);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadEvent', async () => {
    await eventService.upload(restaurantToken, testEvent);

    const [foundEvent]: ResGetEventList[] = await eventService.getList();
    expect(testEvent).toEqual(foundEvent);

    const { eventId }: Event = await eventService.get();
    await eventService.remove(eventId);
  });
});
