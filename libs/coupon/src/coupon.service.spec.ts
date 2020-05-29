import { config } from '@app/config';
import { Coupon, mongodb_entities, mysql_entities } from '@app/entity';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { TokenModule } from '@app/token';
import { DtoCreateRestaurant, DtoUploadCoupon } from '@app/type/req';
import { ResGetCoupon, ResSignIn } from '@app/type/res';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { CouponModule } from './coupon.module';
import { CouponService } from './coupon.service';

describe('CouponService', () => {
  let r_service: RestaurantService;
  let service: CouponService;
  const test_r: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
    area: 'coupon',
    category: 'coupon_test',
    close_time: 'e',
    day_off: 'f',
    description: 'group',
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
  const test_c: DtoUploadCoupon = {
    discount_amount: 500,
    expired_day: new Date(Date.now() + 86400000),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CouponModule, RestaurantModule, TokenModule,
        TypeOrmModule.forRoot(config.mysql_config),
        TypeOrmModule.forRoot(config.mongodb_config),
        TypeOrmModule.forFeature(mysql_entities, 'mysql'),
        TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
        UtilModule,
      ],
      providers: [CouponService],
    }).compile();

    service = module.get<CouponService>(CouponService);
    r_service = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success get()', async () => {
    await r_service.create(test_r);
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: test_r.email,
      password: test_r.password,
    });

    await service.upload(access_token, test_c);

    const f_coupon: ResGetCoupon = await service.get(access_token);
    if (test_c.discount_amount !== f_coupon.discount_amount) {
      throw Error();
    }

    const { c_id }: Coupon = await service.get_coupon(test_c.discount_amount);
    await service.remove(c_id);

    await r_service.leave(access_token);
  });
});
