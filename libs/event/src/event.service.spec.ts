import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { mysqlEntities, mongodbEntities } from '@app/entity';
import { RestaurantService, RestaurantModule } from '@app/restaurant';
import { DtoUploadEvent, DtoCreateRestaurant, ResGetEventList } from '@app/type';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { EventModule } from './event.module';
import { EventService } from './event.service';

describe('EventService', () => {
  let restaurantService: RestaurantService;
  let restaurantToken: string;
  let service: EventService;
  const testEvent: DtoUploadEvent = {
    bannerImage: 'image.url', mainImage: 'url.image',
  };
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'event_test',
    closeTime: 'element',
    dayOff: 'f',
    description: 'g',
    email: 'event_test@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'event_test',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'evnet_test',
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

    service = module.get<EventService>(EventService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadEvent', async () => {
    await restaurantService.create(testRestaurant);
    restaurantToken = (await restaurantService.signIn({
      email: testRestaurant.email,
      password: testRestaurant.password,
    })).accessToken;

    await service.upload(restaurantToken, testEvent);

    const [foundEvent]: ResGetEventList[] = await service.getList();
    expect(testEvent).toEqual(foundEvent);
  });
});
