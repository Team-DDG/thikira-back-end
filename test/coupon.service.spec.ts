import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { CouponModule, CouponService } from '@app/coupon';
import { Coupon, mongodbEntities, mysqlEntities } from '@app/entity';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { DtoCreateRestaurant, DtoUploadCoupon, ResGetCoupon } from '@app/type';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('CouponService', () => {
  let couponService: CouponService;
  let restaurantService: RestaurantService;
  let restaurantToken: string;
  const testCoupon: DtoUploadCoupon = {
    discountAmount: 500,
    expiredDay: new Date(Date.now() + 86400000),
  };
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'coupon',
    category: 'couponTest',
    closeTime: 'element',
    dayOff: 'f',
    description: 'group',
    email: 'couponTest@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'couponTest',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'couponTest',
    phone: '01012345678',
    roadAddress: 'b',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CouponModule, RestaurantModule, AuthModule,
        TypeOrmModule.forRoot(config.mysqlConfig),
        TypeOrmModule.forRoot(config.mongodbConfig),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UtilModule,
      ],
      providers: [CouponService],
    }).compile();

    couponService = module.get<CouponService>(CouponService);
    restaurantService = module.get<RestaurantService>(RestaurantService);

    await restaurantService.create(testRestaurant);
    ({ accessToken: restaurantToken } = await restaurantService.signIn({
      email: testRestaurant.email,
      password: testRestaurant.password,
    }));
  });

  afterAll(async () => {
    await restaurantService.leave(restaurantToken);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success get()', async () => {
    await couponService.upload(restaurantToken, testCoupon);

    const foundCoupon: ResGetCoupon = await couponService.get(restaurantToken);
    if (testCoupon.discountAmount !== foundCoupon.discountAmount) {
      throw Error();
    }

    const { couponId }: Coupon = await couponService.getCoupon(testCoupon.discountAmount);
    await couponService.remove(couponId);
  });
});
