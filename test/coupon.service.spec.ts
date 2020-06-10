import { AuthModule, AuthService } from '@app/auth';
import { config } from '@app/config';
import { CouponModule, CouponService } from '@app/coupon';
import { Coupon, mongodbEntities, mysqlEntities } from '@app/entity';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { DtoCreateRestaurant, DtoUploadCoupon, ResGetCoupon, ResSignIn } from '@app/type';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('CouponService', () => {
  let auth_service: AuthService;
  let coupon_service: CouponService;
  let restaurant_service: RestaurantService;
  let restaurant_id: number;
  const testCoupon: DtoUploadCoupon = {
    discount_amount: 500,
    expired_day: new Date(Date.now() + 86400000),
  };
  const test_restaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'coupon',
    category: 'couponTest',
    close_time: 'e',
    day_off: 'f',
    description: 'group',
    email: 'couponTest@gmail.com',
    image: 'image.url',
    min_price: 10000,
    name: 'couponTest',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    password: 'couponTest',
    phone: '01012345678',
    road_address: 'b',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CouponModule, RestaurantModule, AuthModule,
        TypeOrmModule.forRoot(config.mysql_config),
        TypeOrmModule.forRoot(config.mongodb_config),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UtilModule,
      ],
      providers: [CouponService],
    }).compile();

    auth_service = module.get<AuthService>(AuthService);
    coupon_service = module.get<CouponService>(CouponService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);

    await restaurant_service.create(test_restaurant);
    const { access_token }: ResSignIn = await restaurant_service.signIn({
      email: test_restaurant.email,
      password: test_restaurant.password,
    });
    ({ id: restaurant_id } = auth_service.parseToken(access_token));
  });

  afterAll(async () => {
    await restaurant_service.leave(restaurant_id);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success get()', async () => {
    await coupon_service.upload(restaurant_id, testCoupon);

    const found_coupon: ResGetCoupon = await coupon_service.get(restaurant_id);
    if (testCoupon.discount_amount !== found_coupon.discount_amount) {
      throw Error();
    }

    const { c_id }: Coupon = await coupon_service.getCoupon(testCoupon.discount_amount);
    await coupon_service.remove(c_id);
  });
});
