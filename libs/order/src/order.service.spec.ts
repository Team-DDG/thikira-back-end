import { ConfigModule, config } from '@app/config';
import { DBModule, EnumOrderStatus, EnumPaymentType, Order, mongodb_entities, mysql_entities } from '@app/db';
import { DtoCreateRestaurant, DtoCreateUser, DtoUploadOrder, EnumSortOption } from '@app/req';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule, UserService } from '@app/user';
import { INestApplication } from '@nestjs/common';
import { MenuModule } from '@app/menu';
import { OrderModule } from './order.module';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { getConnection } from 'typeorm';

describe('OrderService', () => {
  let app: INestApplication;
  let restaurant_service: RestaurantService;
  let restaurant_token: string;
  let service: OrderService;
  const test_restaurant: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
    area: 'c',
    category: 'order_test',
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
  let test_req: DtoUploadOrder = {
    discount_amount: 500,
    menu: [{
      group: [{
        name: '치킨 유형',
        option: [{
          name: '순살',
          price: 1000,
        }],
      }],
      name: '쁘링클',
      price: 17000,
      quantity: 2,
    }, {
      name: '갈릭 소스',
      price: 500,
      quantity: 3,
    }],
    payment_type: EnumPaymentType.ONLINE,
    quantity: 0,
    r_id: 0,
  };
  const test_user: DtoCreateUser = {
    email: 'order_test',
    nickname: 'order_test',
    password: 'order_test',
    phone: '01012345678',
  };
  let user_service: UserService;
  let user_token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DBModule, MenuModule, OrderModule, RestaurantModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          name: 'mysql',
          useFactory() {
            return { ...config.mysql_config, entities: mysql_entities };
          },
        }), TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          name: 'mongodb',
          useFactory() {
            return { ...config.mongodb_config, entities: mongodb_entities };
          },
        }), UserModule, UtilModule],
      providers: [OrderService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<OrderService>(OrderService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);
    user_service = module.get<UserService>(UserService);

    await restaurant_service.create(test_restaurant);
    restaurant_token = (await restaurant_service.sign_in({
      email: test_restaurant.email,
      password: test_restaurant.password,
    })).access_token;

    const r_id = (await restaurant_service.get_list({
      category: test_restaurant.category,
      sort_option: EnumSortOption.NEARNESS,
    }))[0].r_id;
    test_req = { ...test_req, r_id };

    await user_service.create(test_user);
    user_token = (await user_service.sign_in({
      email: test_user.email,
      password: test_user.password,
    })).access_token;
  });

  afterAll(async () => {
    await restaurant_service.leave(restaurant_token);
    await user_service.leave(user_token);
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
    await app.close();
  });

  it('200 upload_order', async () => {
    await service.upload(user_token, test_req);
  });

  it('200 edit_order_status', async () => {
    let found_order: Order = await service.get_order(test_req.payment_type);

    await service.edit_order_status({ od_id: found_order.od_id.toString(), status: EnumOrderStatus.DONE });

    found_order = await service.get_order(test_req.payment_type);
    if (found_order.od_payment_type !== test_req.payment_type) {
      throw Error();
    }

    await service.remove_order(found_order.od_id);
  });
});
