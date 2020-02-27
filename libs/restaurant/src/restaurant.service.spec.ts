import { ConfigModule, config } from '@app/config';
import { DBModule, mysql_entities } from '@app/db';
import { ResRefresh, ResSignIn } from '@app/res';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RestaurantModule } from './restaurant.module';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { stringify } from 'querystring';

describe('RestaurantService', () => {
  let access_token: string;
  let app: INestApplication;
  let refresh_token: string;
  let service: RestaurantService;
  const test_req = {
    add_parcel: '경기도 이천시 증포동 404-9',
    add_street: '경기 이천시 아리역로 25 남구빌딩',
    area: '증포동, 창전동',
    category: '치킨',
    close_time: '00:00',
    day_off: '주일날은 교회에 갑니다.',
    description: '증포동 bbq 입니다.',
    email: 'restaurant_test@gmail.com',
    image: 'image_url',
    min_price: 17500,
    name: 'restaurant_test',
    offline_payment: false,
    online_payment: true,
    open_time: '15:00',
    password: 'restaurant_test',
    phone: '01012345678',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DBModule, RestaurantModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory() {
            return { ...config.orm_config, entities: mysql_entities };
          },
        }), UtilModule],
      providers: [RestaurantService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('404 sign_in()', async () => {
    await expect(service.sign_in({ email: test_req.email, password: test_req.password })).rejects.toThrow();
  });

  it('200 check_email()', async () => {
    await service.check_email({ email: test_req.email });
  });

  it('200 sign_up()', async () => {
    await service.create_restaurant(test_req);
  });

  it('409 sign_up()', async () => {
    await expect(service.create_restaurant(test_req)).rejects.toThrow();
  });

  it('409 check_email()', async () => {
    await expect(service.check_email({ email: test_req.email })).rejects.toThrow();
  });

  it('200 sign_in()', async () => {
    const result: ResSignIn = await service.sign_in({ email: test_req.email, password: test_req.password });
    access_token = result.access_token;
    refresh_token = result.refresh_token;
  });

  it('200 refresh()', async () => {
    const result: ResRefresh = await service.refresh(refresh_token);
    access_token = result.access_token;
  });

  it('200 edit_info()', async () => {
    const edit_data = {
      area: '창전동',
      close_time: '00:00',
      day_off: '절에 다닙니다.',
      description: '증포동 bbq 입니다.',
      image: 'url.image',
      min_price: 20000,
      name: '업체',
      offline_payment: true,
      online_payment: false,
      open_time: '15:00',
      phone: '01012345679',
    };
    await service.edit_info(access_token, edit_data);
    const found_restaurant = await service.get(access_token);
    if (stringify(edit_data) !== found_restaurant.get_info()) {
      throw new Error();
    }

  });

  it('200 edit_address()', async () => {
    const edit_data = {
      add_parcel: '경기도 어딘가',
      add_street: '경기도 어딘가',
    };
    await service.edit_address(access_token, edit_data);
    const found_restaurant = await service.get(access_token);
    if (stringify(edit_data) !== found_restaurant.get_address()) {
      throw new Error();
    }
  });

  it('200 check_password()', async () => {
    await service.check_password(access_token, { password: test_req.password });
  });

  it('401 check_password()', async () => {
    await expect(service.check_password(access_token, { password: `${test_req.password}1` })).rejects.toThrow();
  });

  it('200 edit_password()', async () => {
    await service.edit_password(access_token, { password: `${test_req.email}1` });
    await service.sign_in({ email: test_req.email, password: `${test_req.email}1` });
  });

  it('200 leave()', async () => {
    await service.leave(access_token);
  });
});
