import { AuthModule, AuthService } from '@app/auth';
import { config } from '@app/config';
import { EnumPaymentType, mongodbEntities, mysqlEntities } from '@app/entity';
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
  ResGetOrderListByRestaurant,
  ResGetOrderListByUser,
  ResGetReviewListByRestaurant,
  ResGetReviewListByUser,
  ResLoadRestaurant,
  ResSignIn,
} from '@app/type';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('ReviewService', () => {
  let auth_service: AuthService;
  let order_service: OrderService;
  let restaurant_service: RestaurantService;
  const restaurant_ids: number[] = [];
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
  const user_ids: number[] = [];

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

    auth_service = module.get<AuthService>(AuthService);
    review_service = module.get<ReviewService>(ReviewService);
    order_service = module.get<OrderService>(OrderService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);
    user_service = module.get<UserService>(UserService);


    await Promise.all([...Array(6).keys()].map(async (e: number): Promise<void> => {

      await user_service.create({
        ...test_restaurant,
        email: e.toString() + test_user.email,
        nickname: e.toString() + test_user.nickname,
      });

      const { access_token }: ResSignIn = await user_service.signIn({
        email: e.toString() + test_user.email,
        password: test_user.password,
      });
      user_ids.push(auth_service.parseToken(access_token).id);
    }));
    await Promise.all([...Array(4).keys()].map(async (e: number): Promise<void> => {
      await restaurant_service.create({
        ...test_restaurant,
        email: e.toString() + test_restaurant.email,
        name: e.toString() + test_restaurant.name,
      });

      const { access_token }: ResSignIn = await restaurant_service.signIn({
        email: e.toString() + test_restaurant.email,
        password: test_restaurant.password,
      });
      restaurant_ids.push(auth_service.parseToken(access_token).id);
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

  it('Should success uploadReview', async () => {
    await Promise.all([0, 1].map(async (e: number): Promise<void> => {
      await expect(review_service.checkReview(user_ids[e],
        { r_id: restaurant_ids[0].toString() })).rejects.toThrow();

      await order_service.upload(user_ids[e], { ...test_order, r_id: restaurant_ids[0] });

      await review_service.checkReview(user_ids[e], { r_id: restaurant_ids[0].toString() });
      await review_service.uploadReview(user_ids[e], { ...test_review, r_id: restaurant_ids[0], star: e });

      await expect(review_service.checkReview(user_ids[e],
        { r_id: restaurant_ids[0].toString() })).rejects.toThrow();
    }));

    const [found_review]: ResGetReviewListByUser[] = await review_service.getReviewListByUser(user_ids[0]);
    const [req_review, res_review] = TestUtilService
      .makeElementComparable({ ...test_review, star: 0 }, found_review, [
        'r_id', 'rv_id', 'create_time', 'edit_time', 'is_edited', 'reply_review',
      ]);

    expect(req_review).toStrictEqual(res_review);

    const { star }: ResLoadRestaurant = await restaurant_service.load(restaurant_ids[0]);

    expect(star).toEqual(0.5);

    await Promise.all([0, 1].map(async (e: number): Promise<void> => {
      await review_service.removeReview(user_ids[e], { r_id: restaurant_ids[0].toString() });

      const [found_order]: ResGetOrderListByUser[] = await order_service.getListByUser(user_ids[e]);
      await order_service.removeOrder(found_order.od_id);
    }));
  });

  it('Should success editReview', async () => {
    const edit_data: DtoEditReview = {
      content: '구욷!', image: 'url.image', r_id: restaurant_ids[1], star: 3.5,
    };

    await Promise.all([2, 3].map(async (e: number): Promise<void> => {
      await order_service.upload(user_ids[e], { ...test_order, r_id: restaurant_ids[1] });

      await review_service.checkReview(user_ids[e], { r_id: restaurant_ids[1].toString() });
      await review_service.uploadReview(user_ids[e], { ...test_review, r_id: restaurant_ids[1] });
    }));

    await review_service.editReview(user_ids[2], { ...edit_data });

    const [found_review]: ResGetReviewListByUser[] = await review_service.getReviewListByUser(user_ids[2]);

    expect(found_review.is_edited).toEqual(true);
    expect(found_review.edit_time).toBeDefined();

    const [req_review, res_review] = TestUtilService.makeElementComparable(edit_data, found_review, [
      'rv_id', 'create_time', 'edit_time', 'is_edited', 'reply_review',
    ]);

    expect(req_review).toStrictEqual(res_review);

    const { star }: ResLoadRestaurant = await restaurant_service.load(restaurant_ids[1]);

    expect(star).toEqual(4.25);

    await Promise.all([2, 3].map(async (e: number): Promise<void> => {
      await review_service.removeReview(user_ids[e], { r_id: restaurant_ids[1].toString() });

      const [found_order]: ResGetOrderListByUser[] = await order_service.getListByUser(user_ids[e]);
      await order_service.removeOrder(found_order.od_id);
    }));

  });

  it('Should success uploadReplyReview', async () => {
    await order_service.upload(user_ids[4], { ...test_order, r_id: restaurant_ids[2] });

    await review_service.checkReview(user_ids[4], { r_id: restaurant_ids[2].toString() });
    await review_service.uploadReview(user_ids[4], { ...test_review, r_id: restaurant_ids[2] });

    await review_service.uploadReplyReview(restaurant_ids[2], { ...test_reply_review, u_id: user_ids[4] });
    const [found_review]: ResGetReviewListByRestaurant[] = await review_service
      .getReviewListByRestaurant(restaurant_ids[2]);

    const [req_reply_review, res_reply_review] = TestUtilService
      .makeElementComparable(test_reply_review, found_review.reply_review, [
        'create_time', 'edit_time', 'is_edited', 'u_id',
      ]);

    expect(req_reply_review).toStrictEqual(res_reply_review);

    await review_service.removeReplyReview(restaurant_ids[2], { u_id: user_ids[4].toString() });
    await review_service.removeReview(user_ids[4], { r_id: restaurant_ids[2].toString() });

    const [found_order]: ResGetOrderListByRestaurant[] = await order_service
      .getListByRestaurant(restaurant_ids[2]);
    await order_service.removeOrder(found_order.od_id);
  });

  it('Should success editReplyReview', async () => {
    await order_service.upload(user_ids[5], { ...test_order, r_id: restaurant_ids[3] });

    await review_service.checkReview(user_ids[5], { r_id: restaurant_ids[3].toString() });
    await review_service.uploadReview(user_ids[5], { ...test_review, r_id: restaurant_ids[3] });

    await review_service.uploadReplyReview(restaurant_ids[3], { ...test_reply_review, u_id: user_ids[5] });

    const edit_data: DtoEditReplyReview = { content: '죄송합니다', u_id: user_ids[5] };
    await review_service.editReplyReview(restaurant_ids[3], edit_data);

    const [found_review]: ResGetReviewListByUser[] = await review_service.getReviewListByUser(user_ids[5]);

    expect(found_review.reply_review.is_edited).toEqual(true);
    expect(found_review.reply_review.edit_time).toBeDefined();

    const [req_reply_review, res_reply_review] = TestUtilService
      .makeElementComparable(edit_data, found_review.reply_review,
        ['r_id', 'create_time', 'edit_time', 'is_edited', 'u_id']);

    expect(req_reply_review).toStrictEqual(res_reply_review);

    await review_service.removeReview(user_ids[5], { r_id: restaurant_ids[3].toString() });

    const [found_order]: ResGetOrderListByRestaurant[] = await order_service
      .getListByRestaurant(restaurant_ids[3]);
    await order_service.removeOrder(found_order.od_id);
  });
});
