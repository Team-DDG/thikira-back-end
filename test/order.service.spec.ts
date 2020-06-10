import { AuthModule, AuthService } from '@app/auth';
import { config } from '@app/config';
import { EnumOrderStatus, EnumPaymentType, mongodbEntities, mysqlEntities } from '@app/entity';
import { OrderModule, OrderService } from '@app/order';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import {
  DtoCreateRestaurant,
  DtoCreateUser,
  DtoUploadOrder,
  ResGetOrderListByRestaurant,
  ResSignIn,
} from '@app/type';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('OrderService', () => {
  let auth_service: AuthService;
  let order_service: OrderService;
  let restaurant_service: RestaurantService;
  const restaurant_ids: number[] = [];
  const test_order: DtoUploadOrder = {
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
  const test_restaurant: DtoCreateRestaurant = {
    address: 'a',
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
    road_address: 'b',
  };
  const test_user: DtoCreateUser = {
    email: 'order_test',
    nickname: 'order_test',
    password: 'order_test',
    phone: '01012345678',
  };
  let user_service: UserService;
  const user_ids: number[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        OrderModule, RestaurantModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysql_config),
        TypeOrmModule.forRoot(config.mongodb_config),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UserModule, UtilModule,
      ],
      providers: [OrderService],
    }).compile();

    auth_service = module.get<AuthService>(AuthService);
    order_service = module.get<OrderService>(OrderService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);
    user_service = module.get<UserService>(UserService);

    await Promise.all([...Array(3).keys()].map(async (e: number): Promise<void> => {
      await restaurant_service.create({
        ...test_restaurant,
        email: e.toString() + test_restaurant.email,
        name: e.toString() + test_restaurant.name,
      });
      await user_service.create({
        ...test_restaurant,
        email: e.toString() + test_user.email,
        nickname: e.toString() + test_user.nickname,
      });

      let { access_token }: ResSignIn = await restaurant_service.signIn({
        email: e.toString() + test_restaurant.email,
        password: test_restaurant.password,
      });
      restaurant_ids.push(auth_service.parseToken(access_token).id);

      ({ access_token } = await user_service.signIn({
        email: e.toString() + test_user.email,
        password: test_user.password,
      }));
      user_ids.push(auth_service.parseToken(access_token).id);
    }));
  });

  afterAll(async () => {
    await Promise.all(user_ids.map(async (e_id: number): Promise<void> =>
      user_service.leave(e_id),
    ));
    await Promise.all(restaurant_ids.map(async (e_id: number): Promise<void> =>
      restaurant_service.leave(e_id),
    ));

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadOrder', async () => {
    await order_service.upload(user_ids[0], { ...test_order, r_id: restaurant_ids[0] });

    const [found_order]: ResGetOrderListByRestaurant[] = await order_service
      .getListByRestaurant(restaurant_ids[0]);

    let [req_order, res_order] = TestUtilService.makeElementComparable(found_order, test_order, [
      'road_address', 'address', 'create_time', 'menu', 'nickname', 'od_id',
      'order_detail', 'phone', 'r_id', 'status', 'total_price', 'u_id',
    ]);
    expect(req_order).toEqual(res_order);

    [req_order, res_order] = TestUtilService
      .makeElementComparable(found_order.order_detail[0], test_order.menu[0], ['sub_price', 'group']);
    expect(req_order).toEqual(res_order);

    [req_order, res_order] = TestUtilService.makeElementComparable(
      found_order.order_detail[0].group[0], test_order.menu[0].group[0], ['option']);
    expect(req_order).toEqual(res_order);

    expect(found_order.order_detail[0].group[0].option[0]).toEqual(test_order.menu[0].group[0].option[0]);

    await order_service.removeOrder(found_order.od_id);
  });

  it('200 editOrderStatus', async () => {
    await order_service.upload(user_ids[1], { ...test_order, r_id: restaurant_ids[1] });

    let [found_order]: ResGetOrderListByRestaurant[] = await order_service
      .getListByRestaurant(restaurant_ids[1]);

    await order_service.editOrderStatus({ od_id: found_order.od_id, status: EnumOrderStatus.DONE });

    [found_order] = await order_service.getListByRestaurant(restaurant_ids[1]);
    expect(found_order.status).toEqual(EnumOrderStatus.DONE);

    await order_service.removeOrder(found_order.od_id);
  });
});
