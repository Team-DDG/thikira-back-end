import { ConfigModule, config } from '@app/config';
import { DBModule, mysql_entities } from '@app/db';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { DtoCreateRestaurant } from '@app/req';
import { INestApplication } from '@nestjs/common';
import { OrderModule } from './order.module';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';

describe('OrderService', () => {
  let app: INestApplication;
  let restaurant_service: RestaurantService;
  let restaurant_token: string;
  let service: OrderService;
  const test_restaurant: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
    area: 'c',
    category: 'd',
    close_time: 'e',
    day_off: 'f',
    description: 'g',
    email: 'order_test@gmail.com',
    image: 'image.url',
    min_price: 10000,
    name: 'order_test',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    password: 'order_test',
    phone: '01012345678',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DBModule, OrderModule, RestaurantModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory() {
            return { ...config.orm_config, entities: mysql_entities };
          },
        }), UtilModule],
      providers: [OrderService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<OrderService>(OrderService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);

    await restaurant_service.create_restaurant(test_restaurant);
    restaurant_token = (await restaurant_service.sign_in({
      email: test_restaurant.email,
      password: test_restaurant.password,
    })).access_token;
  });

  afterAll(async () => {
    await restaurant_service.leave(restaurant_token);
    await app.close();
  });

  it('', async () => {

  });
});
