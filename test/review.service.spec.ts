import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { EnumPaymentType, mongodbEntities, mysqlEntities, Order, Restaurant } from '@app/entity';
import { MenuModule } from '@app/menu';
import { OrderModule, OrderService } from '@app/order';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { ReviewModule, ReviewService } from '@app/review';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import {
  DtoCreateRestaurant,
  DtoCreateUser,
  DtoEditReplyReview,
  DtoEditReview,
  DtoUploadOrder,
  DtoUploadReplyReview,
  DtoUploadReview,
  ResGetReviewList,
  ResSignIn,
} from '@app/type';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('ReviewService', () => {
  let orderService: OrderService;
  let restaurantService: RestaurantService;
  let restaurantTokens: string[];
  let reviewService: ReviewService;
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
  let userTokens: string[];

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

    reviewService = module.get<ReviewService>(ReviewService);
    orderService = module.get<OrderService>(OrderService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
    userService = module.get<UserService>(UserService);

    const testUsers: DtoCreateUser[] = [];
    const testRestaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 6; i++) {
      testUsers.push({
        ...testUser,
        email: i.toString() + testUser.email,
        nickname: testUser.nickname + i.toString(),
      });
    }
    for (let i: number = 0; i < 4; i++) {
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
      })))
      .map((elementRes: ResSignIn): string => {
        return elementRes.accessToken;
      });

    restaurantTokens = (await Promise.all(testRestaurants
      .map(async (elementRestaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurantService.create(elementRestaurant);
        return restaurantService.signIn({
          email: elementRestaurant.email,
          password: elementRestaurant.password,
        });
      })))
      .map((elementRes: ResSignIn): string => {
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

  it('Should success uploadReview', async () => {
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantTokens[0]);

    await Promise.all([0, 1].map(async (element: number): Promise<void> => {
      await expect(reviewService.checkReview(userTokens[element],
        { restaurantId: restaurantId.toString() })).rejects.toThrow();

      await orderService.upload(userTokens[element], { ...testOrder, restaurantId });

      await reviewService.checkReview(userTokens[element], { restaurantId: restaurantId.toString() });
      await reviewService.uploadReview(userTokens[element], { ...testReview, restaurantId, star: element });

      await expect(reviewService.checkReview(userTokens[element],
        { restaurantId: restaurantId.toString() })).rejects.toThrow();
    }));

    const [foundReview]: ResGetReviewList[] = await reviewService.getReviewListByUser(userTokens[0]);
    const [requestReview, responseReview] = TestUtilService
      .makeElementComparable({ ...testReview, star: 0 }, foundReview, [
        'restaurantId', 'reviewId', 'createTime', 'editTime', 'isEdited', 'replyReview',
      ]);

    expect(requestReview).toStrictEqual(responseReview);

    const { star }: Restaurant = await restaurantService.get(restaurantTokens[0]);

    expect(star).toEqual(0.5);

    await Promise.all([0, 1].map(async (element: number): Promise<void> => {
      await reviewService.removeReview(userTokens[element], { restaurantId: restaurantId.toString() });

      const [foundOrder]: Order[] = await orderService
        .getOrderListByRestaurantUser(restaurantTokens[0], userTokens[element]);
      await orderService.removeOrder(foundOrder.orderId);
    }));
  });

  it('Should success editReview', async () => {
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantTokens[1]);

    const editData: DtoEditReview = {
      content: '구욷!', image: 'url.image', restaurantId, star: 3.5,
    };

    await Promise.all([2, 3].map(async (element: number): Promise<void> => {
      await orderService.upload(userTokens[element], { ...testOrder, restaurantId });

      await reviewService.checkReview(userTokens[element], { restaurantId: restaurantId.toString() });
      await reviewService.uploadReview(userTokens[element], { ...testReview, restaurantId });
    }));

    await reviewService.editReview(userTokens[2], editData);

    const [foundReview]: ResGetReviewList[] = await reviewService.getReviewListByUser(userTokens[2]);

    expect(foundReview.isEdited).toEqual(true);
    expect(foundReview.editTime).toBeDefined();

    const [requestReview, responseReview] = TestUtilService.makeElementComparable(editData, foundReview, [
      'reviewId', 'createTime', 'editTime', 'isEdited', 'replyReview',
    ]);

    expect(requestReview).toStrictEqual(responseReview);

    const { star }: Restaurant = await restaurantService.get(restaurantTokens[1]);

    expect(star).toEqual(4.25);

    await Promise.all([2, 3].map(async (element: number): Promise<void> => {
      await reviewService.removeReview(userTokens[element], { restaurantId: restaurantId.toString() });

      const [foundOrder]: Order[] = await orderService
        .getOrderListByRestaurantUser(restaurantTokens[1], userTokens[element]);
      await orderService.removeOrder(foundOrder.orderId);
    }));

  });

  it('Should success uploadReplyReview', async () => {
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantTokens[2]);

    await orderService.upload(userTokens[4], { ...testOrder, restaurantId });

    await reviewService.checkReview(userTokens[4], { restaurantId: restaurantId.toString() });
    await reviewService.uploadReview(userTokens[4], { ...testReview, restaurantId });

    const [{ reviewId }]: ResGetReviewList[] = await reviewService.getReviewListByUser(userTokens[4]);
    await reviewService.uploadReplyReview(restaurantTokens[2], { ...testReplyReview, reviewId });

    const [foundReview]: ResGetReviewList[] = await reviewService.getReviewListByUser(userTokens[4]);
    const [requestReplyReview, responseReplyReview] = TestUtilService
      .makeElementComparable(testReplyReview, foundReview.replyReview, [
        'reviewId', 'restaurantId', 'createTime', 'editTime', 'isEdited',
      ]);

    expect(requestReplyReview).toStrictEqual(responseReplyReview);

    await reviewService.removeReplyReview(restaurantTokens[2]);
    await reviewService.removeReview(userTokens[4], { restaurantId: restaurantId.toString() });

    const [foundOrder]: Order[] = await orderService
      .getOrderListByRestaurantUser(restaurantTokens[2], userTokens[4]);
    await orderService.removeOrder(foundOrder.orderId);
  });

  it('Should success editReplyReview', async () => {
    const { restaurantId }: Restaurant = await restaurantService.get(restaurantTokens[3]);

    await orderService.upload(userTokens[5], { ...testOrder, restaurantId });

    await reviewService.checkReview(userTokens[5], { restaurantId: restaurantId.toString() });
    await reviewService.uploadReview(userTokens[5], { ...testReview, restaurantId });

    const [{ reviewId }]: ResGetReviewList[] = await reviewService.getReviewListByUser(userTokens[5]);
    await reviewService.uploadReplyReview(restaurantTokens[3], { ...testReplyReview, reviewId });

    const editData: DtoEditReplyReview = { content: '죄송합니다' };
    await reviewService.editReplyReview(restaurantTokens[3], editData);

    const [foundReview]: ResGetReviewList[] = await reviewService.getReviewListByUser(userTokens[5]);

    expect(foundReview.replyReview.isEdited).toEqual(true);
    expect(foundReview.replyReview.editTime).toBeDefined();

    const [requestReplyReview, responseReplyReview] = TestUtilService
      .makeElementComparable(editData, foundReview.replyReview,
        ['reviewId', 'restaurantId', 'createTime', 'editTime', 'isEdited']);

    expect(requestReplyReview).toStrictEqual(responseReplyReview);

    await reviewService.removeReview(userTokens[5], { restaurantId: restaurantId.toString() });

    const [foundOrder]: Order[] = await orderService
      .getOrderListByRestaurantUser(restaurantTokens[3], userTokens[5]);
    await orderService.removeOrder(foundOrder.orderId);
  });
});
