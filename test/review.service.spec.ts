import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { EnumPaymentType, mongodbEntities, mysqlEntities, Order, Restaurant, User } from '@app/entity';
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
  ResSignIn,
} from '@app/type';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { ResGetReviewListByRestaurant } from '../libs/type/src/res/review/get-review-list-by-restaurant.res';
import { ResGetReviewListByUser } from '../libs/type/src/res/review/get-review-list-by-user.res';

describe('ReviewService', () => {
  let order_service: OrderService;
  let restaurant_service: RestaurantService;
  let restaurant_tokens: string[];
  let review_service: ReviewService;
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
    }, {
      name: '갈릭 소스',
      price: 500,
      quantity: 3,
    }],
    payment_type: EnumPaymentType.ONLINE,
    r_id: 0,
  };
  const test_restaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'review_test',
    close_time: 'e',
    day_off: 'f',
    description: 'g',
    email: 'review_test@gmail.com',
    image: 'image.url',
    min_price: 10000,
    name: 'review_test',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    password: 'review_test',
    phone: '01012345678',
    road_address: 'b',
  };
  const test_reply_review: DtoUploadReplyReview = {
    content: '감사합니다',
    u_id: null,
  };
  const test_review: DtoUploadReview = {
    content: '감사합니다',
    image: 'image.url',
    r_id: null,
    star: 5,
  };
  const test_user: DtoCreateUser = {
    email: 'review_test',
    nickname: 'review_test',
    password: 'review_test',
    phone: '01012345678',
  };
  let user_service: UserService;
  let user_tokens: string[];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MenuModule, OrderModule, RestaurantModule,
        ReviewModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysql_config),
        TypeOrmModule.forRoot(config.mongodb_config),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UserModule, UtilModule,
      ],
      providers: [OrderService],
    }).compile();

    review_service = module.get<ReviewService>(ReviewService);
    order_service = module.get<OrderService>(OrderService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);
    user_service = module.get<UserService>(UserService);

    const test_users: DtoCreateUser[] = [];
    const test_restaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 6; i++) {
      test_users.push({
        ...test_user,
        email: i.toString() + test_user.email,
        nickname: test_user.nickname + i.toString(),
      });
    }
    for (let i: number = 0; i < 4; i++) {
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
      })))
      .map((e_res: ResSignIn): string => {
        return e_res.access_token;
      });

    restaurant_tokens = (await Promise.all(test_restaurants
      .map(async (e_restaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurant_service.create(e_restaurant);
        return restaurant_service.signIn({
          email: e_restaurant.email,
          password: e_restaurant.password,
        });
      })))
      .map((e_res: ResSignIn): string => {
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

  it('Should success uploadReview', async () => {
    const { r_id }: Restaurant = await restaurant_service.get(restaurant_tokens[0]);

    await Promise.all([0, 1].map(async (e: number): Promise<void> => {
      await expect(review_service.checkReview(user_tokens[e],
        { r_id: r_id.toString() })).rejects.toThrow();

      await order_service.upload(user_tokens[e], { ...test_order, r_id });

      await review_service.checkReview(user_tokens[e], { r_id: r_id.toString() });
      await review_service.uploadReview(user_tokens[e], { ...test_review, r_id, star: e });

      await expect(review_service.checkReview(user_tokens[e],
        { r_id: r_id.toString() })).rejects.toThrow();
    }));

    const [found_review]: ResGetReviewListByUser[] = await review_service.getReviewListByUser(user_tokens[0]);
    const [req_review, res_review] = TestUtilService
      .makeElementComparable({ ...test_review, star: 0 }, found_review, [
        'r_id', 'rv_id', 'create_time', 'edit_time', 'is_edited', 'reply_review',
      ]);

    expect(req_review).toStrictEqual(res_review);

    const { star }: Restaurant = await restaurant_service.get(restaurant_tokens[0]);

    expect(star).toEqual(0.5);

    await Promise.all([0, 1].map(async (e: number): Promise<void> => {
      await review_service.removeReview(user_tokens[e], { r_id: r_id.toString() });

      const [found_order]: Order[] = await order_service
        .getOrderListByRestaurantUser(restaurant_tokens[0], user_tokens[e]);
      await order_service.removeOrder(found_order.od_id);
    }));
  });

  it('Should success editReview', async () => {
    const { r_id }: Restaurant = await restaurant_service.get(restaurant_tokens[1]);

    const edit_data: DtoEditReview = {
      content: '구욷!', image: 'url.image', r_id, star: 3.5,
    };

    await Promise.all([2, 3].map(async (e: number): Promise<void> => {
      await order_service.upload(user_tokens[e], { ...test_order, r_id });

      await review_service.checkReview(user_tokens[e], { r_id: r_id.toString() });
      await review_service.uploadReview(user_tokens[e], { ...test_review, r_id });
    }));

    await review_service.editReview(user_tokens[2], { ...edit_data });

    const [found_review]: ResGetReviewListByUser[] = await review_service.getReviewListByUser(user_tokens[2]);

    expect(found_review.is_edited).toEqual(true);
    expect(found_review.edit_time).toBeDefined();

    const [req_review, res_review] = TestUtilService.makeElementComparable(edit_data, found_review, [
      'rv_id', 'create_time', 'edit_time', 'is_edited', 'reply_review',
    ]);

    expect(req_review).toStrictEqual(res_review);

    const { star }: Restaurant = await restaurant_service.get(restaurant_tokens[1]);

    expect(star).toEqual(4.25);

    await Promise.all([2, 3].map(async (e: number): Promise<void> => {
      await review_service.removeReview(user_tokens[e], { r_id: r_id.toString() });

      const [found_order]: Order[] = await order_service
        .getOrderListByRestaurantUser(restaurant_tokens[1], user_tokens[e]);
      await order_service.removeOrder(found_order.od_id);
    }));

  });

  it('Should success uploadReplyReview', async () => {
    const { r_id }: Restaurant = await restaurant_service.get(restaurant_tokens[2]);
    const { u_id }: User = await user_service.get(user_tokens[4]);

    await order_service.upload(user_tokens[4], { ...test_order, r_id });

    await review_service.checkReview(user_tokens[4], { r_id: r_id.toString() });
    await review_service.uploadReview(user_tokens[4], { ...test_review, r_id });

    await review_service.uploadReplyReview(restaurant_tokens[2], { ...test_reply_review, u_id });
    const [found_review]: ResGetReviewListByRestaurant[] = await review_service
      .getReviewListByRestaurant(restaurant_tokens[2]);

    const [req_reply_review, res_reply_review] = TestUtilService
      .makeElementComparable(test_reply_review, found_review.reply_review, [
        'create_time', 'edit_time', 'is_edited', 'u_id',
      ]);

    expect(req_reply_review).toStrictEqual(res_reply_review);

    await review_service.removeReplyReview(restaurant_tokens[2], { u_id: u_id.toString() });
    await review_service.removeReview(user_tokens[4], { r_id: r_id.toString() });

    const [found_order]: Order[] = await order_service
      .getOrderListByRestaurantUser(restaurant_tokens[2], user_tokens[4]);
    await order_service.removeOrder(found_order.od_id);
  });

  it('Should success editReplyReview', async () => {
    const { r_id }: Restaurant = await restaurant_service.get(restaurant_tokens[3]);
    const { u_id }: User = await user_service.get(user_tokens[5]);

    await order_service.upload(user_tokens[5], { ...test_order, r_id });

    await review_service.checkReview(user_tokens[5], { r_id: r_id.toString() });
    await review_service.uploadReview(user_tokens[5], { ...test_review, r_id });

    await review_service.uploadReplyReview(restaurant_tokens[3], { ...test_reply_review, u_id });

    const edit_data: DtoEditReplyReview = { content: '죄송합니다', u_id };
    await review_service.editReplyReview(restaurant_tokens[3], edit_data);

    const [found_review]: ResGetReviewListByUser[] = await review_service.getReviewListByUser(user_tokens[5]);

    expect(found_review.reply_review.is_edited).toEqual(true);
    expect(found_review.reply_review.edit_time).toBeDefined();

    const [req_reply_review, res_reply_review] = TestUtilService
      .makeElementComparable(edit_data, found_review.reply_review,
        ['r_id', 'create_time', 'edit_time', 'is_edited', 'u_id']);

    expect(req_reply_review).toStrictEqual(res_reply_review);

    await review_service.removeReview(user_tokens[5], { r_id: r_id.toString() });

    const [found_order]: Order[] = await order_service
      .getOrderListByRestaurantUser(restaurant_tokens[3], user_tokens[5]);
    await order_service.removeOrder(found_order.od_id);
  });
});
