import { ConfigModule, config } from '@app/config';
import { Coupon, DBModule, mongodb_entities, mysql_entities } from '@app/db';
import { DtoCreateRestaurant, DtoUploadCoupon } from '@app/type/req';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { CouponModule } from './coupon.module';
import { CouponService } from './coupon.service';
import { ResGetCoupon } from '@app/type/res';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { getConnection } from 'typeorm';

describe('CouponService', () => {
  let r_service: RestaurantService;
  let r_token: string;
  let service: CouponService;
  const test_r: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
    area: 'c',
    category: 'coupon_test',
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
        }), UtilModule],
      providers: [CouponService],
    }).compile();

    service = module.get<CouponService>(CouponService);
    r_service = module.get<RestaurantService>(RestaurantService);

    await r_service.create(test_r);
    r_token = (await r_service.sign_in({
      email: test_r.email,
      password: test_r.password,
    })).access_token;

    await service.upload(r_token, test_req);
  });

  afterAll(async () => {
    const { c_id }: Coupon = await service.get_coupon(test_req.discount_amount);
    await service.remove(c_id);

    await r_service.leave(r_token);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success get()', async () => {
    const f_c: ResGetCoupon = await service.get(r_token);
    if (test_req.discount_amount !== f_c.discount_amount) {
      throw Error();
    }
  });
});
