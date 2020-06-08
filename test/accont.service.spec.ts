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
  let restaurantService: RestaurantService;
  let restaurantTokens: string[];
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'accountTest',
    closeTime: 'element',
    dayOff: 'f',
    description: 'g',
    email: 'accountTest@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'accountTest',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'accountTest',
    phone: '01012345678',
    roadAddress: 'b',
  };
  const testUser: DtoCreateUser = {
    email: 'accountTest',
    nickname: 'accountTest',
    password: 'accountTest',
    phone: '01012345678',
  };
  let userService: UserService;
  let userTokens: string[];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RestaurantModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysqlConfig),
        TypeOrmModule.forRoot(config.mongodbConfig),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UserModule, UtilModule,
      ],
      providers: [RestaurantService, UserService],
    }).compile();

    restaurantService = module.get<RestaurantService>(RestaurantService);
    userService = module.get<UserService>(UserService);

    const testUsers: DtoCreateUser[] = [];
    const testRestaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 3; i++) {
      testUsers.push({
        ...testUser,
        email: i.toString() + testUser.email,
        nickname: testUser.nickname + i.toString(),
      });
      testRestaurants.push({
        ...testRestaurant,
        email: i.toString() + testRestaurant.email,
        name: testRestaurant.name + i.toString(),
      });
    }

    userTokens = (await Promise.all(testUsers
      .map(async (elementUser: DtoCreateUser): Promise<ResSignIn> => {
        await userService.create(elementUser);
        return userService.signIn({
          email: elementUser.email,
          password: elementUser.password,
        });
      })))
      .map((elementRes: ResSignIn): string => elementRes.accessToken);
    restaurantTokens = (await Promise.all(testRestaurants
      .map(async (elementRestaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurantService.create(elementRestaurant);
        return restaurantService.signIn({
          email: elementRestaurant.email,
          password: elementRestaurant.password,
        });
      })))
      .map((elementRes: ResSignIn): string => elementRes.accessToken);

    await userService.create(testUser);
    ({ refreshToken: userTokens[3] } = await userService.signIn({
      email: testUser.email,
      password: testUser.password,
    }));

    await restaurantService.create(testRestaurant);
    ({ refreshToken: restaurantTokens[3] } = await restaurantService.signIn({
      email: testRestaurant.email,
      password: testRestaurant.password,
    }));
  });

  afterAll(async () => {
    await Promise.all(userTokens.map(async (elementToken: string): Promise<void> =>
      userService.leave(elementToken)));
    await Promise.all(restaurantTokens.map(async (elementToken: string): Promise<void> =>
      restaurantService.leave(elementToken)));

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success editInfo()', async () => {
    const restaurantEditData: DtoEditRestaurantInfo = {
      area: '창전동',
      closeTime: '00:00',
      dayOff: '절에 다닙니다.',
      description: '증포동 bbq 입니다.',
      image: 'url.image',
      minPrice: 20000,
      name: '업체',
      offlinePayment: true,
      onlinePayment: false,
      openTime: '15:00',
      phone: '01012345679',
    };
    const userEditData: DtoEditUserInfo = {
      nickname: '업체',
      phone: '01012345679',
    };

    await restaurantService.edit(restaurantTokens[0], restaurantEditData);
    await userService.edit(userTokens[0], userEditData);

    const foundRestaurant: ResLoadRestaurant = await restaurantService.load(restaurantTokens[0]);
    const [requestRestaurant, responseRestaurant] = TestUtilService
      .makeElementComparable(foundRestaurant, restaurantEditData,
        ['address', 'category', 'createTime', 'email', 'roadAddress', 'star']);
    expect(requestRestaurant).toStrictEqual(responseRestaurant);

    const foundUser: ResLoadUser = await userService.load(userTokens[0]);
    const [requestUser, responseUser] = TestUtilService
      .makeElementComparable(foundUser, userEditData,
        ['address', 'roadAddress', 'category', 'createTime']);
    expect(requestUser).toStrictEqual(responseUser);
  });

  it('Should success editAddress()', async () => {
    const editData: DtoEditAddress = {
      address: '경기도 어딘가',
      roadAddress: '경기도 어딘가',
    };
    await restaurantService.edit(restaurantTokens[1], editData);
    await userService.edit(userTokens[1], editData);

    const foundRestaurant: ResLoadRestaurant = await restaurantService.load(restaurantTokens[1]);
    const foundUser: ResLoadUser = await userService.load(userTokens[1]);

    ['roadAddress', 'address'].map((element: string) => {
      expect(foundRestaurant[element]).toEqual(editData[element]);
      expect(foundUser[element]).toEqual(editData[element]);
    });
  });

  it('Should success editPassword()', async () => {
    await restaurantService.checkPassword(restaurantTokens[2], {
      password: testRestaurant.password,
    });
    await userService.checkPassword(userTokens[2], { password: testUser.password });

    const restaurantEditData: DtoEditPassword = { password: `${testRestaurant.password}_edit` };
    const userEditData: DtoEditPassword = { password: `${testUser.password}_edit` };

    await restaurantService.editPassword(restaurantTokens[2], restaurantEditData);
    await userService.editPassword(userTokens[2], userEditData);

    await restaurantService.checkPassword(restaurantTokens[2], restaurantEditData);
    await userService.checkPassword(userTokens[2], userEditData);

  });

  it('Should success refresh()', async () => {
    expect(restaurantService.refresh(restaurantTokens[3])).toBeDefined();
    expect(userService.refresh(userTokens[3])).toBeDefined();
  });
});
