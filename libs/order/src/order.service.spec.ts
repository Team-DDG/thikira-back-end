import { DtoCreateRestaurant, DtoCreateUser, DtoUploadOrder } from '@app/type/req';
import { EnumOrderStatus, EnumPaymentType, mongodb_entities, mysql_entities } from '@app/entity';
import { EnumSortOption, ResGetOrderList, ResGetRestaurantList } from '@app/type';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { UserModule, UserService } from '@app/user';
import { OrderModule } from './order.module';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { config } from '@app/config';
import { getConnection } from 'typeorm';

describe('OrderService', () => {
  let r_service: RestaurantService;
  let r_token: string;
  let service: OrderService;
  const test_od: DtoUploadOrder = {
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
    }],
    payment_type: EnumPaymentType.ONLINE,
    r_id: 0,
  };
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
  const test_u: DtoCreateUser = {
    email: 'order_test',
    nickname: 'order_test',
    password: 'order_test',
    phone: '01012345678',
  };
  let u_service: UserService;
  let u_token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        OrderModule, RestaurantModule, TestUtilModule,
        TypeOrmModule.forRoot({
          ...config.mysql_config,
          entities: mysql_entities,
          name: 'mysql',
        }),
        TypeOrmModule.forRoot({
          ...config.mongodb_config,
          entities: mongodb_entities,
          name: 'mongodb',
        }),
        TypeOrmModule.forFeature(mysql_entities, 'mysql'),
        TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
        UserModule, UtilModule,
      ],
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
    r_service = module.get<RestaurantService>(RestaurantService);
    u_service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 upload_order_status', async () => {
    await r_service.create(test_r);
    r_token = (await r_service.sign_in({
      email: test_r.email,
      password: test_r.password,
    })).access_token;

    const { r_id }: ResGetRestaurantList = (await r_service.get_list({
      category: test_r.category, sort_option: EnumSortOption.NEARNESS,
    }))[0];

    await u_service.create(test_u);
    u_token = (await u_service.sign_in({
      email: test_u.email,
      password: test_u.password,
    })).access_token;

    await service.upload(u_token, { ...test_od, r_id });

    const f_order: ResGetOrderList = (await service.get_list_by_restaurant(r_token))[0];

    let [req_od, res_od] = TestUtilService.make_comparable(f_order, test_od, [
      'add_street', 'add_parcel', 'create_time', 'menu', 'nickname',
      'od_id', 'order_detail', 'phone', 'r_id', 'status', 'total_price',
    ]);
    expect(req_od).toEqual(res_od);
    [req_od, res_od] = TestUtilService.make_comparable(f_order.order_detail[0], test_od.menu[0], [
      'sub_price', 'group',
    ]);
    expect(req_od).toEqual(res_od);
    [req_od, res_od] = TestUtilService.make_comparable(
      f_order.order_detail[0].group[0], test_od.menu[0].group[0], ['option']);
    expect(req_od).toEqual(res_od);
    expect(f_order.order_detail[0].group[0].option[0]).toEqual(test_od.menu[0].group[0].option[0]);
    await service.remove_order(f_order.od_id);

    await r_service.leave(r_token);
    await u_service.leave(u_token);
  });

  it('200 edit_order_status', async () => {
    const restaurant: { email: string; name: string } = {
      email: `2${test_r.email}`, name: `${test_r.name}_2`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    r_token = (await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    })).access_token;

    const { r_id }: ResGetRestaurantList = (await r_service.get_list({
      category: test_r.category, sort_option: EnumSortOption.NEARNESS,
    }))[0];

    const user: { email: string; nickname: string } = {
      email: `2${test_u.email}`, nickname: `${test_u.nickname}_2`,
    };
    await u_service.create({ ...test_u, ...user });
    u_token = (await u_service.sign_in({
      email: user.email,
      password: test_u.password,
    })).access_token;

    await service.upload(u_token, { ...test_od, r_id });

    let f_order: ResGetOrderList = (await service.get_list_by_restaurant(r_token))[0];

    await service.edit_order_status({ od_id: f_order.od_id, status: EnumOrderStatus.DONE });

    f_order = (await service.get_list_by_restaurant(r_token))[0];
    expect(f_order.status).toEqual(EnumOrderStatus.DONE);

    await service.remove_order(f_order.od_id);

    await r_service.leave(r_token);
    await u_service.leave(u_token);
  });
});
