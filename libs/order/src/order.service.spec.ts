import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { EnumPaymentType, mongodbEntities, mysqlEntities, EnumOrderStatus } from '@app/entity';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { EnumSortOption, ResGetOrderList, ResGetRestaurantList, DtoUploadOrder } from '@app/type';
import { DtoCreateRestaurant, DtoCreateUser } from '@app/type/req';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { OrderModule } from './order.module';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let restaurantService: RestaurantService;
  let restaurantToken: string;
  let service: OrderService;
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
  let userToken: string;

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

    service = module.get<OrderService>(OrderService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('200 uploadOrder', async () => {
    await restaurantService.create(testRestaurant);
    restaurantToken = (await restaurantService.signIn({
      email: testRestaurant.email,
      password: testRestaurant.password,
    })).accessToken;

    const [{ restaurantId }]: ResGetRestaurantList[] = await restaurantService.getList({
      category: testRestaurant.category, sortOption: EnumSortOption.NEARNESS,
    });

    await userService.create(testUser);
    userToken = (await userService.signIn({
      email: testUser.email,
      password: testUser.password,
    })).accessToken;

    await service.upload(userToken, { ...testOrder, restaurantId });

    const [foundOrder]: ResGetOrderList[] = await service.getListByRestaurant(restaurantToken);

    let [requestOrder, responseOrder] = TestUtilService.makeElementComparable(foundOrder, testOrder, [
      'roadAddress', 'address', 'createTime', 'menu', 'nickname',
      'orderId', 'orderDetail', 'phone', 'restaurantId', 'status', 'totalPrice',
    ]);
    expect(requestOrder).toEqual(responseOrder);
    [requestOrder, responseOrder] = TestUtilService
      .makeElementComparable(foundOrder.orderDetail[0], testOrder.menu[0], ['subPrice', 'group']);
    expect(requestOrder).toEqual(responseOrder);
    [requestOrder, responseOrder] = TestUtilService.makeElementComparable(
      foundOrder.orderDetail[0].group[0], testOrder.menu[0].group[0], ['option']);
    expect(requestOrder).toEqual(responseOrder);
    expect(foundOrder.orderDetail[0].group[0].option[0]).toEqual(testOrder.menu[0].group[0].option[0]);
    await service.removeOrder(foundOrder.orderId);

    await restaurantService.leave(restaurantToken);
    await userService.leave(userToken);
  });

  it('200 editOrderStatus', async () => {
    const restaurant: { email: string; name: string } = {
      email: `2${testRestaurant.email}`, name: `${testRestaurant.name}_2`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    restaurantToken = (await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    })).accessToken;

    const [{ restaurantId }]: ResGetRestaurantList[] = await restaurantService.getList({
      category: testRestaurant.category, sortOption: EnumSortOption.NEARNESS,
    });

    const user: { email: string; nickname: string } = {
      email: `2${testUser.email}`, nickname: `${testUser.nickname}_2`,
    };
    await userService.create({ ...testUser, ...user });
    userToken = (await userService.signIn({
      email: user.email,
      password: testUser.password,
    })).accessToken;

    await service.upload(userToken, { ...testOrder, restaurantId });

    let [foundOrder]: ResGetOrderList[] = await service.getListByRestaurant(restaurantToken);

    await service.editOrderStatus({ orderId: foundOrder.orderId, status: EnumOrderStatus.DONE });

    [foundOrder] = await service.getListByRestaurant(restaurantToken);
    expect(foundOrder.status).toEqual(EnumOrderStatus.DONE);

    await service.removeOrder(foundOrder.orderId);

    await restaurantService.leave(restaurantToken);
    await userService.leave(userToken);
  });
});
