import { ConfigModule, config } from '@app/config';
import { DBModule, mongodb_entities, mysql_entities } from '@app/db';
import { DtoEditAddress, DtoEditRestaurantInfo } from '@app/type';
import { ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/type/res';
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantModule } from './restaurant.module';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { classToPlain } from 'class-transformer';
import { getConnection } from 'typeorm';

describe('RestaurantService', () => {
  let access_token: string;
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
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);

    await service.create(test_req);
  });

  afterAll(async () => {
    await service.leave(access_token);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should fail check_email()', async () => {
    await expect(service.check_email({ email: test_req.email })).rejects.toThrow();
  });

  it('Should success sign_in()', async () => {
    const res: ResSignIn = await service.sign_in({ email: test_req.email, password: test_req.password });
    access_token = res.access_token;
    refresh_token = res.refresh_token;
  });

  it('Should success refresh()', async () => {
    const res: ResRefresh = await service.refresh(refresh_token);
    access_token = res.access_token;
  });

  it('Should success edit_info()', async () => {
    const edit_data: DtoEditRestaurantInfo = {
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
    await service.edit(access_token, edit_data);
    const f_r: ResLoadRestaurant = await service.get(access_token);
    ['add_parcel', 'add_street', 'category', 'create_time'].forEach((key) => {
      Reflect.deleteProperty(f_r, key);
    });
    expect(classToPlain(f_r)).toStrictEqual(classToPlain(edit_data));
  });

  it('Should success edit_address()', async () => {
    const edit_data: DtoEditAddress = {
      add_parcel: '경기도 어딘가',
      add_street: '경기도 어딘가',
    };
    await service.edit(access_token, edit_data);
    const f_r: ResLoadRestaurant = await service.get(access_token);
    if (edit_data.add_street !== f_r.add_street ||
      edit_data.add_parcel !== f_r.add_parcel) {
      throw new Error();
    }
  });

  it('Should success check_password()', async () => {
    await service.check_password(access_token, { password: test_req.password });
  });

  it('Should fail check_password()', async () => {
    await expect(service.check_password(access_token, { password: `${test_req.password}1` })).rejects.toThrow();
  });

  it('Should success edit_password()', async () => {
    await service.edit(access_token, { password: `${test_req.email}1` });
    await service.sign_in({ email: test_req.email, password: `${test_req.email}1` });
  });
});
