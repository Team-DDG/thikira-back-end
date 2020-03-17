import { ConfigModule, config } from '@app/config';
import { DBModule, EnumOrderStatus, EnumPaymentType, Order, mongodb_entities, mysql_entities } from '@app/db';
import { DtoCreateRestaurant, DtoCreateUser, DtoUploadOrder, EnumSortOption } from '@app/type/req';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule, UserService } from '@app/user';
import { MenuModule } from '@app/menu';
import { OrderModule } from './order.module';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { getConnection } from 'typeorm';

describe('OrderService', () => {
  let r_service: RestaurantService;
  let restaurant_token: string;
  let service: OrderService;
  const test_r: DtoCreateRestaurant = {
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
    m: [{
      g: [{
        name: '치킨 유형',
        o: [{
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
  const test_u: DtoCreateUser = {
    email: 'order_test',
    nickname: 'order_test',
    password: 'order_test',
    phone: '01012345678',
  };
  let u_service: UserService;
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

    service = module.get<OrderService>(OrderService);
    r_service = module.get<RestaurantService>(RestaurantService);
    u_service = module.get<UserService>(UserService);

    await r_service.create(test_r);
    restaurant_token = (await r_service.sign_in({
      email: test_r.email,
      password: test_r.password,
    })).access_token;

    const r_id = (await r_service.get_list({
      category: test_r.category,
      sort_option: EnumSortOption.NEARNESS,
    }))[0].r_id;
    test_req = { ...test_req, r_id };

    await u_service.create(test_u);
    user_token = (await u_service.sign_in({
      email: test_u.email,
      password: test_u.password,
    })).access_token;

    await service.upload(user_token, test_req);
  });

  afterAll(async () => {
    await r_service.leave(restaurant_token);
    await u_service.leave(user_token);
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 edit_order_status', async () => {
    let f_od: Order = await service.get_order(test_req.r_id);

    await service.edit_order_status({ od_id: f_od.od_id.toString(), status: EnumOrderStatus.DONE });

    f_od = await service.get_order(test_req.r_id);
    if (EnumOrderStatus.DONE !== f_od.status) {
      throw Error();
    }

    await service.remove_order(f_od.od_id);
  });
});
