import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { Coupon, mongodbEntities, mysqlEntities } from '@app/entity';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { DtoCreateRestaurant, DtoUploadCoupon } from '@app/type/req';
import { ResGetCoupon, ResSignIn } from '@app/type/res';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { CouponModule } from './coupon.module';
import { CouponService } from './coupon.service';

describe('CouponService', () => {
  let restaurantService: RestaurantService;
  let service: CouponService;
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'coupon',
    category: 'coupon_test',
    closeTime: 'element',
    dayOff: 'f',
    description: 'group',
    email: 'coupon_test@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'coupon_test',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'coupon_test',
    phone: '01012345678',
    roadAddress: 'b',
  };
  const testCoupon: DtoUploadCoupon = {
    discountAmount: 500,
    expiredDay: new Date(Date.now() + 86400000),
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

    service = module.get<CouponService>(CouponService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success get()', async () => {
    await restaurantService.create(testRestaurant);
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: testRestaurant.email,
      password: testRestaurant.password,
    });

    await service.upload(accessToken, testCoupon);

    const foundCoupon: ResGetCoupon = await service.get(accessToken);
    if (testCoupon.discountAmount !== foundCoupon.discountAmount) {
      throw Error();
    }

    const { couponId }: Coupon = await service.getCoupon(testCoupon.discountAmount);
    await service.remove(couponId);

    await restaurantService.leave(accessToken);
  });
});
