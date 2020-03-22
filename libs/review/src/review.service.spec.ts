import { ConfigModule, config } from '@app/config';
import { DBModule, EnumPaymentType, Order, Restaurant, mongodb_entities, mysql_entities } from '@app/db';
import {
  DtoCreateRestaurant, DtoCreateUser, DtoEditReplyReview, DtoEditReview,
  DtoUploadOrder, DtoUploadReplyReview, DtoUploadReview, ResGetReviewList,
} from '@app/type';
import { OrderModule, OrderService } from '@app/order';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { UserModule, UserService } from '@app/user';
import { MenuModule } from '@app/menu';
import { ReviewModule } from './review.module';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { getConnection } from 'typeorm';

describe('ReviewService', () => {
  let od_service: OrderService;
  let r_service: RestaurantService;
  let service: ReviewService;
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
    }, {
      name: '갈릭 소스',
      price: 500,
      quantity: 3,
    }],
    payment_type: EnumPaymentType.ONLINE,
    r_id: 0,
  };
  const test_r: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
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
  };
  const test_rr: DtoUploadReplyReview = {
    content: '감사합니다',
    rv_id: null,
  };
  const test_rv: DtoUploadReview = {
    content: '감사합니다',
    image: 'image.url',
    r_id: null,
    star: 5,
  };
  const test_u: DtoCreateUser = {
    email: 'review_test',
    nickname: 'review_test',
    password: 'review_test',
    phone: '01012345678',
  };
  let u_service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DBModule, MenuModule, OrderModule, RestaurantModule, ReviewModule, TestUtilModule,
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

    service = module.get<ReviewService>(ReviewService);
    od_service = module.get<OrderService>(OrderService);
    r_service = module.get<RestaurantService>(RestaurantService);
    u_service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success upload_review', async () => {
    await u_service.create(test_u);
    const u_token: string = (await u_service.sign_in({ email: test_u.email, password: test_u.password })).access_token;

    await r_service.create(test_r);
    const r_token: string = (await r_service.sign_in({ email: test_r.email, password: test_r.password })).access_token;
    const { r_id }: Restaurant = await r_service.get(r_token);

    await expect(service.check_review(u_token, { r_id: r_id.toString() })).rejects.toThrow();

    await od_service.upload(u_token, { ...test_od, r_id });

    await service.check_review(u_token, { r_id: r_id.toString() });
    await service.upload_review(u_token, { ...test_rv, r_id });

    await expect(service.check_review(u_token, { r_id: r_id.toString() })).rejects.toThrow();

    const f_review: ResGetReviewList = (await service.get_review_list_by_user(u_token))[0];
    const [req_rv, res_rv] = TestUtilService.make_comparable(test_rv, f_review, [
      'r_id', 'rv_id', 'create_time', 'edit_time', 'is_edited', 'reply_review',
    ]);

    expect(req_rv).toStrictEqual(res_rv);

    await service.remove_review(u_token);

    const f_order: Order = (await od_service.get_orders_by_restaurant_user(r_token, u_token))[0];
    await od_service.remove_order(f_order.od_id);

    await u_service.leave(u_token);
    await r_service.leave(r_token);
  });

  it('Should success edit_review', async () => {
    const user: { email: string; nickname: string } = { email: `2${test_u.email}`, nickname: `${test_u.nickname}_2` };
    await u_service.create({ ...test_u, ...user });
    const u_token: string = (await u_service.sign_in({ email: user.email, password: test_u.password })).access_token;

    const restaurant: { email: string; name: string } = { email: `2${test_r.email}`, name: `${test_r.name}_2` };
    await r_service.create({ ...test_r, ...restaurant });
    const r_token: string = (await r_service.sign_in({ email: restaurant.email, password: test_r.password })).access_token;
    const { r_id }: Restaurant = await r_service.get(r_token);

    await od_service.upload(u_token, { ...test_od, r_id });

    await service.check_review(u_token, { r_id: r_id.toString() });
    await service.upload_review(u_token, { ...test_rv, r_id });

    const edit_data: DtoEditReview = {
      content: '구욷!', image: 'url.image', star: 3.5,
    };
    await service.edit_review(u_token, edit_data);

    const f_review: ResGetReviewList = (await service.get_review_list_by_user(u_token))[0];

    expect(f_review.is_edited).toEqual(true);
    expect(f_review.edit_time).toBeDefined();

    const [req_rv, res_rv] = TestUtilService.make_comparable(edit_data, f_review, [
      'rv_id', 'create_time', 'edit_time', 'is_edited', 'reply_review',
    ]);

    expect(req_rv).toStrictEqual(res_rv);

    await service.remove_review(u_token);

    const f_order: Order = (await od_service.get_orders_by_restaurant_user(r_token, u_token))[0];
    await od_service.remove_order(f_order.od_id);

    await u_service.leave(u_token);
    await r_service.leave(r_token);
  });

  it('Should success upload_reply_review', async () => {
    const user: { email: string; nickname: string } = { email: `3${test_u.email}`, nickname: `${test_u.nickname}_3` };
    await u_service.create({ ...test_u, ...user });
    const u_token: string = (await u_service.sign_in({ email: user.email, password: test_u.password })).access_token;

    const restaurant: { email: string; name: string } = { email: `3${test_r.email}`, name: `${test_r.name}_3` };
    await r_service.create({ ...test_r, ...restaurant });
    const r_token: string = (await r_service.sign_in({ email: restaurant.email, password: test_r.password })).access_token;
    const { r_id }: Restaurant = await r_service.get(r_token);

    await od_service.upload(u_token, { ...test_od, r_id });

    await service.check_review(u_token, { r_id: r_id.toString() });
    await service.upload_review(u_token, { ...test_rv, r_id });

    const { rv_id }: ResGetReviewList = (await service.get_review_list_by_user(u_token))[0];
    await service.upload_reply_review(r_token, { ...test_rr, rv_id });

    const f_review: ResGetReviewList = (await service.get_review_list_by_user(u_token))[0];
    const [req_rr, res_rr] = TestUtilService.make_comparable(test_rr, f_review.reply_review, [
      'rv_id', 'rr_id', 'create_time', 'edit_time', 'is_edited',
    ]);

    expect(req_rr).toStrictEqual(res_rr);

    await service.remove_reply_review(r_token);
    await service.remove_review(u_token);

    const f_order: Order = (await od_service.get_orders_by_restaurant_user(r_token, u_token))[0];
    await od_service.remove_order(f_order.od_id);

    await u_service.leave(u_token);
    await r_service.leave(r_token);
  });

  it('Should success edit_reply_review', async () => {
    const user: { email: string; nickname: string } = { email: `4${test_u.email}`, nickname: `${test_u.nickname}_4` };
    await u_service.create({ ...test_u, ...user });
    const u_token: string = (await u_service.sign_in({ email: user.email, password: test_u.password })).access_token;

    const restaurant: { email: string; name: string } = { email: `4${test_r.email}`, name: `${test_r.name}_4` };
    await r_service.create({ ...test_r, ...restaurant });
    const r_token: string = (await r_service.sign_in({ email: restaurant.email, password: test_r.password })).access_token;
    const { r_id }: Restaurant = await r_service.get(r_token);

    await od_service.upload(u_token, { ...test_od, r_id });

    await service.check_review(u_token, { r_id: r_id.toString() });
    await service.upload_review(u_token, { ...test_rv, r_id });

    const { rv_id }: ResGetReviewList = (await service.get_review_list_by_user(u_token))[0];
    await service.upload_reply_review(r_token, { ...test_rr, rv_id });

    const edit_data: DtoEditReplyReview = { content: '죄송합니다' };
    await service.edit_reply_review(r_token, edit_data);

    const f_review: ResGetReviewList = (await service.get_review_list_by_user(u_token))[0];

    expect(f_review.reply_review.is_edited).toEqual(true);
    expect(f_review.reply_review.edit_time).toBeDefined();

    const [req_rr, res_rr] = TestUtilService.make_comparable(edit_data, f_review.reply_review, [
      'rv_id', 'rr_id', 'create_time', 'edit_time', 'is_edited',
    ]);

    expect(req_rr).toStrictEqual(res_rr);

    await service.remove_review(u_token);

    const f_order: Order = (await od_service.get_orders_by_restaurant_user(r_token, u_token))[0];
    await od_service.remove_order(f_order.od_id);

    await u_service.leave(u_token);
    await r_service.leave(r_token);
  });
});
