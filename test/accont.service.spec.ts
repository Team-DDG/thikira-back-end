import { AuthModule, AuthService } from '@app/auth';
import { config } from '@app/config';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import {
  DtoCreateRestaurant,
  DtoCreateUser,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditRestaurantInfo,
  DtoEditUserInfo,
  ResLoadRestaurant,
  ResLoadUser,
  ResSignIn,
} from '@app/type';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('AccountService (User, Restaurant)', () => {
  let auth_service: AuthService;
  const restaurant_ids: number[] = [];
  let restaurant_service: RestaurantService;
  const test_restaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'accountTest',
    close_time: 'e',
    day_off: 'f',
    description: 'g',
    email: 'accountTest@gmail.com',
    image: 'image.url',
    min_price: 10000,
    name: 'accountTest',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    password: 'accountTest',
    phone: '01012345678',
    road_address: 'b',
  };
  const test_user: DtoCreateUser = {
    email: 'accountTest',
    nickname: 'accountTest',
    password: 'accountTest',
    phone: '01012345678',
  };
  const user_ids: number[] = [];
  let user_service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RestaurantModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysql_config),
        TypeOrmModule.forRoot(config.mongodb_config),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UserModule, UtilModule,
      ],
      providers: [RestaurantService, UserService],
    }).compile();

    auth_service = module.get<AuthService>(AuthService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);
    user_service = module.get<UserService>(UserService);

    await Promise.all([...Array(4).keys()].map(async (e: number): Promise<void> => {
      await restaurant_service.create({
        ...test_restaurant,
        email: e.toString() + test_restaurant.email,
        name: e.toString() + test_restaurant.name,
      });
      await user_service.create({
        ...test_restaurant,
        email: e.toString() + test_user.email,
        nickname: e.toString() + test_user.nickname,
      });

      let { access_token }: ResSignIn = await restaurant_service.signIn({
        email: e.toString() + test_restaurant.email,
        password: test_restaurant.password,
      });
      restaurant_ids.push(auth_service.parseToken(access_token).id);

      ({ access_token } = await user_service.signIn({
        email: e.toString() + test_user.email,
        password: test_user.password,
      }));
      user_ids.push(auth_service.parseToken(access_token).id);
    }));
  });

  afterAll(async () => {
    await Promise.all(user_ids.map(async (e_id: number): Promise<void> =>
      user_service.leave(e_id),
    ));
    await Promise.all(restaurant_ids.map(async (e_id: number): Promise<void> =>
      restaurant_service.leave(e_id),
    ));

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success editInfo()', async () => {
    const restaurant_edit_data: DtoEditRestaurantInfo = {
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
    const user_edit_data: DtoEditUserInfo = {
      nickname: '업체',
      phone: '01012345679',
    };

    await restaurant_service.edit(restaurant_ids[0], restaurant_edit_data);
    await user_service.edit(user_ids[0], user_edit_data);

    const found_restaurant: ResLoadRestaurant = await restaurant_service.load(restaurant_ids[0]);
    const [reqRestaurant, resRestaurant] = TestUtilService
      .makeElementComparable(found_restaurant, restaurant_edit_data,
        ['address', 'category', 'create_time', 'email', 'road_address', 'star']);
    expect(reqRestaurant).toStrictEqual(resRestaurant);

    const found_user: ResLoadUser = await user_service.load(user_ids[0]);
    const [req_user, res_user] = TestUtilService
      .makeElementComparable(found_user, user_edit_data,
        ['address', 'road_address', 'category', 'create_time']);
    expect(req_user).toStrictEqual(res_user);
  });

  it('Should success editAddress()', async () => {
    const edit_data: DtoEditAddress = {
      address: '경기도 어딘가',
      road_address: '경기도 어딘가',
    };
    await restaurant_service.edit(restaurant_ids[1], edit_data);
    await user_service.edit(user_ids[1], edit_data);

    const found_restaurant: ResLoadRestaurant = await restaurant_service.load(restaurant_ids[1]);
    const found_user: ResLoadUser = await user_service.load(user_ids[1]);

    ['road_address', 'address'].forEach((e: string) => {
      expect(found_restaurant[e]).toEqual(edit_data[e]);
      expect(found_user[e]).toEqual(edit_data[e]);
    });
  });

  it('Should success editPassword()', async () => {
    await restaurant_service.checkPassword(restaurant_ids[2], {
      password: test_restaurant.password,
    });
    await user_service.checkPassword(user_ids[2], { password: test_user.password });

    const restaurant_edit_data: DtoEditPassword = { password: `${test_restaurant.password}_edit` };
    const user_edit_data: DtoEditPassword = { password: `${test_user.password}_edit` };

    await restaurant_service.editPassword(restaurant_ids[2], restaurant_edit_data);
    await user_service.editPassword(user_ids[2], user_edit_data);

    await restaurant_service.checkPassword(restaurant_ids[2], restaurant_edit_data);
    await user_service.checkPassword(user_ids[2], user_edit_data);

  });

  it('Should success refresh()', async () => {
    expect(restaurant_service.refresh(restaurant_ids[3])).toBeDefined();
    expect(user_service.refresh(user_ids[3])).toBeDefined();
  });
});
