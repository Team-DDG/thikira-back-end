import { ConfigModule, config } from '@app/config';
import { DBModule, mongodb_entities, mysql_entities } from '@app/db';
import { DtoCreateRestaurant, DtoUploadCoupon } from '@app/req';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { CouponModule } from './coupon.module';
import { CouponService } from './coupon.service';
import { INestApplication } from '@nestjs/common';
import { ResGetCoupon } from '@app/res';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { getConnection } from 'typeorm';

describe('CouponService', () => {
  let app: INestApplication;
  let restaurant_service: RestaurantService;
  let restaurant_token: string;
  let service: CouponService;
  const test_restaurant: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
    area: 'c',
    category: 'd',
    close_time: 'e',
    day_off: 'f',
    description: 'g',
    email: 'coupon_test@gmail.com',
    image: 'image.url',
    min_price: 10000,
    name: 'coupon_test',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    password: 'coupon_test',
    phone: '01012345678',
  };
  const test_req: DtoUploadCoupon = {
    discount_amount: 500,
    expired_day: new Date(Date.now() + 86400000),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CouponModule, DBModule, RestaurantModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          name:'mysql',
          useFactory() {
            return { ...config.mysql_config, entities: mysql_entities };
          },
        }), TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          name:'mongodb',
          useFactory() {
            return { ...config.mongodb_config, entities: mongodb_entities };
          },
        }), UtilModule],
      providers: [CouponService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<CouponService>(CouponService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);

    await restaurant_service.create(test_restaurant);
    restaurant_token = (await restaurant_service.sign_in({
      email: test_restaurant.email,
      password: test_restaurant.password,
    })).access_token;
  });

  afterAll(async () => {
    const c_id = (await service.get_coupon(test_req.discount_amount)).c_id;
    await service.remove(c_id);
    await restaurant_service.leave(restaurant_token);
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
    await app.close();
  });

  it('200 upload()', async () => {
    await service.upload(restaurant_token, test_req);
  });

  it('200 get()', async () => {
    const found_coupon: ResGetCoupon = await service.get(restaurant_token);
    if (test_req.discount_amount !== found_coupon.discount_amount) {
      throw Error();
    }
  });
});
