import { DtoCreateRestaurant, DtoEditAddress, DtoEditPassword, DtoEditRestaurantInfo } from '@app/type/req';
import { ResRefresh, ResSignIn } from '@app/type/res';
import { Test, TestingModule } from '@nestjs/testing';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { mongodb_entities, mysql_entities } from '@app/entity';
import { ResLoadRestaurant } from '@app/type/res';
import { RestaurantModule } from './restaurant.module';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { config } from '@app/config';
import { getConnection } from 'typeorm';

describe('RestaurantService', () => {
  let service: RestaurantService;
  const test_r: DtoCreateRestaurant = {
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
        RestaurantModule, TestUtilModule,
        TypeOrmModule.forRoot({
          ...config.mysql_config,
          entities: mysql_entities,
          name: 'mysql',
        }),
        TypeOrmModule.forRoot({
          ...config.mongodb_config,
          entities: mongodb_entities,
          name: 'mongodb',
        }),
        TypeOrmModule.forFeature(mysql_entities, 'mysql'),
        TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
        UtilModule,
      ],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success refresh()', async () => {
    await service.check_email({ email: test_r.email });
    await service.create(test_r);

    const { refresh_token }: ResSignIn = await service.sign_in({
      email: test_r.email, password: test_r.password,
    });
    await expect(service.check_email({ email: test_r.email })).rejects.toThrow();

    const { access_token }: ResRefresh = service.refresh(refresh_token);
    await service.leave(access_token);
  });

  it('Should success edit_info()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `2${test_r.email}`, name: `${test_r.name}_2`,
    };
    await service.check_email({ email: restaurant.email });
    await service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

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

    const f_restaurant: ResLoadRestaurant = await service.load(access_token);
    const [req_r, res_r] = TestUtilService.make_comparable(f_restaurant, edit_data, [
      'add_parcel', 'add_street', 'category', 'create_time',
    ]);
    expect(req_r).toStrictEqual(res_r);

    await service.leave(access_token);
  });

  it('Should success edit_address()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `3${test_r.email}`, name: `${test_r.name}_3`,
    };
    await service.check_email({ email: restaurant.email });
    await service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const edit_data: DtoEditAddress = {
      add_parcel: '경기도 어딘가',
      add_street: '경기도 어딘가',
    };
    await service.edit(access_token, edit_data);

    const f_restaurant: ResLoadRestaurant = await service.load(access_token);
    expect(f_restaurant.add_street).toEqual(edit_data.add_street);
    expect(f_restaurant.add_parcel).toEqual(edit_data.add_parcel);

    await service.leave(access_token);
  });

  it('Should success edit_password()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `4${test_r.email}`, name: `${test_r.name}_4`,
    };
    await service.check_email({ email: restaurant.email });
    await service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    await service.check_password(access_token, { password: test_r.password });
    const edit_data: DtoEditPassword = { password: `${test_r.password}_edit` };
    await service.edit_password(access_token, edit_data);

    await service.sign_in({ ...edit_data, email: restaurant.email });

    await service.leave(access_token);
  });
});
