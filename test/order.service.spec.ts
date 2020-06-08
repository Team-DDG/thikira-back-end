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
  let orderService: OrderService;
  let restaurantService: RestaurantService;
  let restaurantTokens: string[];
  const testOrder: DtoUploadOrder = {
    discountAmount: 500,
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
    paymentType: EnumPaymentType.ONLINE,
    restaurantId: 0,
  };
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'order_test',
    closeTime: 'element',
    dayOff: 'f',
    description: 'g',
    email: 'order_test@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'order_test',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'order_test',
    phone: '01012345678',
    roadAddress: 'b',
  };
  const testUser: DtoCreateUser = {
    email: 'order_test',
    nickname: 'order_test',
    password: 'order_test',
    phone: '01012345678',
  };
  let userService: UserService;
  let userTokens: string[];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        OrderModule, RestaurantModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysqlConfig),
        TypeOrmModule.forRoot(config.mongodbConfig),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UserModule, UtilModule,
      ],
      providers: [OrderService],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
    userService = module.get<UserService>(UserService);

    const testUsers: DtoCreateUser[] = [];
    const testRestaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 2; i++) {
      testUsers.push({
        ...testUser,
        email: i.toString() + testUser.email,
        nickname: testUser.nickname + i.toString(),
      });
      testRestaurants.push({
        ...testRestaurant,
        email: i.toString() + testUser.email,
        name: testRestaurant.name + i.toString(),
      });
    }

    userTokens = (await Promise.all(testUsers
      .map(async (elementUser: DtoCreateUser): Promise<ResSignIn> => {
        await userService.create(elementUser);
        return userService.signIn({
          email: elementUser.email,
          password: elementUser.password,
        });
      }))).map((elementRes: ResSignIn): string => {
      return elementRes.accessToken;
    });

    restaurantTokens = (await Promise.all(testRestaurants
      .map(async (elementRestaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurantService.create(elementRestaurant);
        return restaurantService.signIn({
          email: elementRestaurant.email,
          password: elementRestaurant.password,
        });
      }))).map((elementRes: ResSignIn): string => {
      return elementRes.accessToken;
    });
  });

  afterAll(async () => {
    await Promise.all(userTokens
      .map(async (elementToken: string): Promise<void> => userService.leave(elementToken)));
    await Promise.all(restaurantTokens
      .map(async (elementToken: string): Promise<void> => restaurantService.leave(elementToken)));

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadOrder', async () => {
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantTokens[0]);

    await orderService.upload(userTokens[0], { ...testOrder, restaurantId });

    const [foundOrder]: ResGetOrderListByRestaurant[] = await orderService
      .getListByRestaurant(restaurantTokens[0]);

    let [requestOrder, responseOrder] = TestUtilService.makeElementComparable(foundOrder, testOrder, [
      'roadAddress', 'address', 'createTime', 'menu', 'nickname', 'orderId',
      'orderDetail', 'phone', 'restaurantId', 'status', 'totalPrice', 'userId',
    ]);
    expect(requestOrder).toEqual(responseOrder);

    [requestOrder, responseOrder] = TestUtilService
      .makeElementComparable(foundOrder.orderDetail[0], testOrder.menu[0], ['subPrice', 'group']);
    expect(requestOrder).toEqual(responseOrder);

    [requestOrder, responseOrder] = TestUtilService.makeElementComparable(
      foundOrder.orderDetail[0].group[0], testOrder.menu[0].group[0], ['option']);
    expect(requestOrder).toEqual(responseOrder);

    expect(foundOrder.orderDetail[0].group[0].option[0]).toEqual(testOrder.menu[0].group[0].option[0]);

    await orderService.removeOrder(foundOrder.orderId);
  });

  it('200 editOrderStatus', async () => {
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantTokens[1]);

    await orderService.upload(userTokens[1], { ...testOrder, restaurantId });

    let [foundOrder]: ResGetOrderListByRestaurant[] = await orderService
      .getListByRestaurant(restaurantTokens[1]);

    await orderService.editOrderStatus({ orderId: foundOrder.orderId, status: EnumOrderStatus.DONE });

    [foundOrder] = await orderService.getListByRestaurant(restaurantTokens[1]);
    expect(foundOrder.status).toEqual(EnumOrderStatus.DONE);

    await orderService.removeOrder(foundOrder.orderId);
  });
});
