import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { EnumPaymentType, mongodbEntities, mysqlEntities, Order, Restaurant } from '@app/entity';
import { MenuModule } from '@app/menu';
import { OrderModule, OrderService } from '@app/order';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import {
  DtoCreateRestaurant,
  DtoCreateUser,
  DtoEditReplyReview,
  DtoEditReview,
  DtoUploadReplyReview,
  DtoUploadReview,
  ResGetReviewList,
  DtoUploadOrder,
} from '@app/type';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { ReviewModule } from './review.module';
import { ReviewService } from './review.service';

describe('ReviewService', () => {
  let orderService: OrderService;
  let restaurantService: RestaurantService;
  let service: ReviewService;
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
    }, {
      name: '갈릭 소스',
      price: 500,
      quantity: 3,
    }],
    paymentType: EnumPaymentType.ONLINE,
    restaurantId: 0,
  };
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'review_test',
    closeTime: 'element',
    dayOff: 'f',
    description: 'g',
    email: 'review_test@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'review_test',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'review_test',
    phone: '01012345678',
    roadAddress: 'b',
  };
  const testReplyReview: DtoUploadReplyReview = {
    content: '감사합니다',
    reviewId: null,
  };
  const testReview: DtoUploadReview = {
    content: '감사합니다',
    image: 'image.url',
    restaurantId: null,
    star: 5,
  };
  const testUser: DtoCreateUser = {
    email: 'review_test',
    nickname: 'review_test',
    password: 'review_test',
    phone: '01012345678',
  };
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MenuModule, OrderModule, RestaurantModule,
        ReviewModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysqlConfig),
        TypeOrmModule.forRoot(config.mongodbConfig),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UserModule, UtilModule,
      ],
      providers: [OrderService],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    orderService = module.get<OrderService>(OrderService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success uploadReview', async () => {
    await userService.create(testUser);
    const userToken: string = (await userService.signIn({
      email: testUser.email, password: testUser.password,
    })).accessToken;

    await restaurantService.create(testRestaurant);
    const restaurantToken: string = (await restaurantService.signIn({
      email: testRestaurant.email, password: testRestaurant.password,
    })).accessToken;
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantToken);

    await expect(service.checkReview(userToken, { restaurantId: restaurantId.toString() })).rejects.toThrow();

    await orderService.upload(userToken, { ...testOrder, restaurantId });

    await service.checkReview(userToken, { restaurantId: restaurantId.toString() });
    await service.uploadReview(userToken, { ...testReview, restaurantId });

    await expect(service.checkReview(userToken, { restaurantId: restaurantId.toString() })).rejects.toThrow();

    const [foundReview]: ResGetReviewList[] = await service.getReviewListByUser(userToken);
    const [requestReview, responseReview] = TestUtilService.makeElementComparable(testReview, foundReview, [
      'restaurantId', 'reviewId', 'createTime', 'editTime', 'isEdited', 'replyReview',
    ]);

    expect(requestReview).toStrictEqual(responseReview);

    await service.removeReview(userToken);

    const [foundOrder]: Order[] = await orderService.getOrderListByRestaurantUser(restaurantToken, userToken);
    await orderService.removeOrder(foundOrder.orderId);

    await userService.leave(userToken);
    await restaurantService.leave(restaurantToken);
  });

  it('Should success editReview', async () => {
    const user: { email: string; nickname: string } = {
      email: `2${testUser.email}`, nickname: `${testUser.nickname}_2`,
    };
    await userService.create({ ...testUser, ...user });
    const userToken: string = (await userService.signIn({
      email: user.email, password: testUser.password,
    })).accessToken;

    const restaurant: { email: string; name: string } = {
      email: `2${testRestaurant.email}`, name: `${testRestaurant.name}_2`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const restaurantToken: string = (await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    })).accessToken;
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantToken);

    await orderService.upload(userToken, { ...testOrder, restaurantId });

    await service.checkReview(userToken, { restaurantId: restaurantId.toString() });
    await service.uploadReview(userToken, { ...testReview, restaurantId });

    const editData: DtoEditReview = {
      content: '구욷!', image: 'url.image', star: 3.5,
    };
    await service.editReview(userToken, editData);

    const [foundReview]: ResGetReviewList[] = await service.getReviewListByUser(userToken);

    expect(foundReview.isEdited).toEqual(true);
    expect(foundReview.editTime).toBeDefined();

    const [requestReview, responseReview] = TestUtilService.makeElementComparable(editData, foundReview, [
      'reviewId', 'createTime', 'editTime', 'isEdited', 'replyReview',
    ]);

    expect(requestReview).toStrictEqual(responseReview);

    await service.removeReview(userToken);

    const [foundOrder]: Order[] = await orderService.getOrderListByRestaurantUser(restaurantToken, userToken);
    await orderService.removeOrder(foundOrder.orderId);

    await userService.leave(userToken);
    await restaurantService.leave(restaurantToken);
  });

  it('Should success uploadReplyReview', async () => {
    const user: { email: string; nickname: string } = {
      email: `3${testUser.email}`, nickname: `${testUser.nickname}_3`,
    };
    await userService.create({ ...testUser, ...user });
    const userToken: string = (await userService.signIn({
      email: user.email, password: testUser.password,
    })).accessToken;

    const restaurant: { email: string; name: string } = {
      email: `3${testRestaurant.email}`, name: `${testRestaurant.name}_3`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const restaurantToken: string = (await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    })).accessToken;
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantToken);

    await orderService.upload(userToken, { ...testOrder, restaurantId });

    await service.checkReview(userToken, { restaurantId: restaurantId.toString() });
    await service.uploadReview(userToken, { ...testReview, restaurantId });

    const [{ reviewId }]: ResGetReviewList[] = await service.getReviewListByUser(userToken);
    await service.uploadReplyReview(restaurantToken, { ...testReplyReview, reviewId });

    const [foundReview]: ResGetReviewList[] = await service.getReviewListByUser(userToken);
    const [requestReplyReview, responseReplyReview] = TestUtilService
      .makeElementComparable(testReplyReview, foundReview.replyReview, [
        'reviewId', 'restaurantId', 'createTime', 'editTime', 'isEdited',
      ]);

    expect(requestReplyReview).toStrictEqual(responseReplyReview);

    await service.removeReplyReview(restaurantToken);
    await service.removeReview(userToken);

    const [foundOrder]: Order[] = await orderService.getOrderListByRestaurantUser(restaurantToken, userToken);
    await orderService.removeOrder(foundOrder.orderId);

    await userService.leave(userToken);
    await restaurantService.leave(restaurantToken);
  });

  it('Should success editReplyReview', async () => {
    const user: { email: string; nickname: string } = {
      email: `4${testUser.email}`, nickname: `${testUser.nickname}_4`,
    };
    await userService.create({ ...testUser, ...user });
    const userToken: string = (await userService.signIn({
      email: user.email, password: testUser.password,
    })).accessToken;

    const restaurant: { email: string; name: string } = {
      email: `4${testRestaurant.email}`, name: `${testRestaurant.name}_4`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const restaurantToken: string = (await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    })).accessToken;
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantToken);

    await orderService.upload(userToken, { ...testOrder, restaurantId });

    await service.checkReview(userToken, { restaurantId: restaurantId.toString() });
    await service.uploadReview(userToken, { ...testReview, restaurantId });

    const [{ reviewId }]: ResGetReviewList[] = await service.getReviewListByUser(userToken);
    await service.uploadReplyReview(restaurantToken, { ...testReplyReview, reviewId });

    const editData: DtoEditReplyReview = { content: '죄송합니다' };
    await service.editReplyReview(restaurantToken, editData);

    const [foundReview]: ResGetReviewList[] = await service.getReviewListByUser(userToken);

    expect(foundReview.replyReview.isEdited).toEqual(true);
    expect(foundReview.replyReview.editTime).toBeDefined();

    const [requestReplyReview, responseReplyReview] = TestUtilService
      .makeElementComparable(editData, foundReview.replyReview,
        ['reviewId', 'restaurantId', 'createTime', 'editTime', 'isEdited']);

    expect(requestReplyReview).toStrictEqual(responseReplyReview);

    await service.removeReview(userToken);

    const [foundOrder]: Order[] = await orderService.getOrderListByRestaurantUser(restaurantToken, userToken);
    await orderService.removeOrder(foundOrder.orderId);

    await userService.leave(userToken);
    await restaurantService.leave(restaurantToken);
  });
});
