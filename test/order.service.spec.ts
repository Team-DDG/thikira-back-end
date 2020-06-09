import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { EnumOrderStatus, EnumPaymentType, mongodbEntities, mysqlEntities, Restaurant } from '@app/entity';
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
  let order_service: OrderService;
  let restaurant_service: RestaurantService;
  let restaurant_tokens: string[];
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
  let user_tokens: string[];

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

    order_service = module.get<OrderService>(OrderService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);
    user_service = module.get<UserService>(UserService);

    const test_users: DtoCreateUser[] = [];
    const test_restaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 2; i++) {
      test_users.push({
        ...test_user,
        email: i.toString() + test_user.email,
        nickname: test_user.nickname + i.toString(),
      });
      test_restaurants.push({
        ...test_restaurant,
        email: i.toString() + test_user.email,
        name: test_restaurant.name + i.toString(),
      });
    }

    user_tokens = (await Promise.all(test_users
      .map(async (e_user: DtoCreateUser): Promise<ResSignIn> => {
        await user_service.create(e_user);
        return user_service.signIn({
          email: e_user.email,
          password: e_user.password,
        });
      }))).map((e_res: ResSignIn): string => {
      return e_res.access_token;
    });

    restaurant_tokens = (await Promise.all(test_restaurants
      .map(async (e_restaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurant_service.create(e_restaurant);
        return restaurant_service.signIn({
          email: e_restaurant.email,
          password: e_restaurant.password,
        });
      }))).map((e_res: ResSignIn): string => {
      return e_res.access_token;
    });
  });

  afterAll(async () => {
    await Promise.all(user_tokens
      .map(async (e_token: string): Promise<void> => user_service.leave(e_token)));
    await Promise.all(restaurant_tokens
      .map(async (e_token: string): Promise<void> => restaurant_service.leave(e_token)));

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadOrder', async () => {
    const { r_id }: Restaurant = await restaurant_service.get(restaurant_tokens[0]);

    await order_service.upload(user_tokens[0], { ...test_order, r_id });

    const [found_order]: ResGetOrderListByRestaurant[] = await order_service
      .getListByRestaurant(restaurant_tokens[0]);

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
    const { r_id }: Restaurant = await restaurant_service.get(restaurant_tokens[1]);

    await order_service.upload(user_tokens[1], { ...test_order, r_id });

    let [found_order]: ResGetOrderListByRestaurant[] = await order_service
      .getListByRestaurant(restaurant_tokens[1]);

    await order_service.editOrderStatus({ od_id: found_order.od_id, status: EnumOrderStatus.DONE });

    [found_order] = await order_service.getListByRestaurant(restaurant_tokens[1]);
    expect(found_order.status).toEqual(EnumOrderStatus.DONE);

    await order_service.removeOrder(found_order.od_id);
  });
});
