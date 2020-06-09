import { AuthModule } from '@app/auth';
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
  let restaurant_service: RestaurantService;
  let restaurant_tokens: string[];
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
  let user_service: UserService;
  let user_tokens: string[];

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

    restaurant_service = module.get<RestaurantService>(RestaurantService);
    user_service = module.get<UserService>(UserService);

    const test_users: DtoCreateUser[] = [];
    const test_restaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 3; i++) {
      test_users.push({
        ...test_user,
        email: i.toString() + test_user.email,
        nickname: test_user.nickname + i.toString(),
      });
      test_restaurants.push({
        ...test_restaurant,
        email: i.toString() + test_restaurant.email,
        name: test_restaurant.name + i.toString(),
      });
    }

    user_tokens = (await Promise.all(test_users
      .map(async (e_user: DtoCreateUser): Promise<ResSignIn> => {
        await user_service.create(e_user);
        return user_service.signIn({
          email: e_user.email,
          password: e_user.password,
        });
      })))
      .map((e_res: ResSignIn): string => e_res.access_token);
    restaurant_tokens = (await Promise.all(test_restaurants
      .map(async (e_restaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurant_service.create(e_restaurant);
        return restaurant_service.signIn({
          email: e_restaurant.email,
          password: e_restaurant.password,
        });
      })))
      .map((e_res: ResSignIn): string => e_res.access_token);

    await user_service.create(test_user);
    ({ refresh_token: user_tokens[3] } = await user_service.signIn({
      email: test_user.email,
      password: test_user.password,
    }));

    await restaurant_service.create(test_restaurant);
    ({ refresh_token: restaurant_tokens[3] } = await restaurant_service.signIn({
      email: test_restaurant.email,
      password: test_restaurant.password,
    }));
  });

  afterAll(async () => {
    await Promise.all(user_tokens.map(async (e_token: string): Promise<void> =>
      user_service.leave(e_token)));
    await Promise.all(restaurant_tokens.map(async (e_token: string): Promise<void> =>
      restaurant_service.leave(e_token)));

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

    await restaurant_service.edit(restaurant_tokens[0], restaurant_edit_data);
    await user_service.edit(user_tokens[0], user_edit_data);

    const found_restaurant: ResLoadRestaurant = await restaurant_service.load(restaurant_tokens[0]);
    const [reqRestaurant, resRestaurant] = TestUtilService
      .makeElementComparable(found_restaurant, restaurant_edit_data,
        ['address', 'category', 'create_time', 'email', 'road_address', 'star']);
    expect(reqRestaurant).toStrictEqual(resRestaurant);

    const found_user: ResLoadUser = await user_service.load(user_tokens[0]);
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
    await restaurant_service.edit(restaurant_tokens[1], edit_data);
    await user_service.edit(user_tokens[1], edit_data);

    const found_restaurant: ResLoadRestaurant = await restaurant_service.load(restaurant_tokens[1]);
    const found_user: ResLoadUser = await user_service.load(user_tokens[1]);

    ['road_address', 'address'].map((e: string) => {
      expect(found_restaurant[e]).toEqual(edit_data[e]);
      expect(found_user[e]).toEqual(edit_data[e]);
    });
  });

  it('Should success editPassword()', async () => {
    await restaurant_service.checkPassword(restaurant_tokens[2], {
      password: test_restaurant.password,
    });
    await user_service.checkPassword(user_tokens[2], { password: test_user.password });

    const restaurant_edit_data: DtoEditPassword = { password: `${test_restaurant.password}_edit` };
    const user_edit_data: DtoEditPassword = { password: `${test_user.password}_edit` };

    await restaurant_service.editPassword(restaurant_tokens[2], restaurant_edit_data);
    await user_service.editPassword(user_tokens[2], user_edit_data);

    await restaurant_service.checkPassword(restaurant_tokens[2], restaurant_edit_data);
    await user_service.checkPassword(user_tokens[2], user_edit_data);

  });

  it('Should success refresh()', async () => {
    expect(restaurant_service.refresh(restaurant_tokens[3])).toBeDefined();
    expect(user_service.refresh(user_tokens[3])).toBeDefined();
  });
});
