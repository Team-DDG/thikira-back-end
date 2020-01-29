import { ConfigModule, ConfigService } from '@app/config';
import { User, UserModule, UserService } from '@app/user';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { RestaurantModule } from './restaurant.module';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let app: INestApplication;
  let service: RestaurantService;
  let userService: UserService;
  const test_value = {
    image: 'image_url',
    name: 'test',
    phone: '01012345678',
    add_street: '경기 이천시 아리역로 25 남구빌딩',
    add_parcel: '경기도 이천시 증포동 404-9',
    area: '증포동, 창전동',
    category: '치킨',
    min_price: 17500,
    day_off: '주일날은 교회에 갑니다.',
    online_payment: true,
    offline_payment: false,
    open_time: '15:00',
    close_time: '00:00',
    description: '증포동 bbq 입니다.',
    email: 'test@gmail.com',
    password: 'test',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule, UserModule, RestaurantModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              ...config.ormConfig,
              entities: [
                Restaurant, User,
              ],
            };
          },
        })],
      providers: [
        { provide: RestaurantService, useValue: [new Repository<Restaurant>()] },
        { provide: UserService, useValue: [new Repository<User>()] },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    app = module.createNestApplication();
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('200 check_email', () => {
    service.check_email({ email: test_value.email });
  });
});
