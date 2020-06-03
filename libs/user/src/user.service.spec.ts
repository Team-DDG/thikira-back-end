import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { RestaurantModule } from '@app/restaurant';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { DtoCreateUser, DtoEditAddress, DtoEditPassword, DtoEditUserInfo } from '@app/type/req';
import { ResLoadUser, ResRefresh, ResSignIn } from '@app/type/res';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  const testUser: DtoCreateUser = {
    email: 'user_test@gmail.com',
    nickname: 'user_test',
    password: 'user_test',
    phone: '01012345678',
  };

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
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success refresh()', async () => {
    await service.checkEmail({ email: testUser.email });
    await service.create(testUser);
    const { refreshToken }: ResSignIn = await service.signIn({
      email: testUser.email, password: testUser.password,
    });
    await expect(service.checkEmail({ email: testUser.email })).rejects.toThrow();

    const { accessToken }: ResRefresh = service.refresh(refreshToken);
    await service.leave(accessToken);
  });

  it('Should success editInfo()', async () => {
    const restaurant: { email: string; nickname: string } = {
      email: `2${testUser.email}`, nickname: `${testUser.nickname}_2`,
    };
    await service.checkEmail({ email: restaurant.email });
    await service.create({ ...testUser, ...restaurant });
    const { accessToken }: ResSignIn = await service.signIn({
      email: restaurant.email, password: testUser.password,
    });

    const editData: DtoEditUserInfo = {
      nickname: '업체',
      phone: '01012345679',
    };
    await service.edit(accessToken, editData);

    const foundRestaurant: ResLoadUser = await service.load(accessToken);
    const [requestRestaurant, responseRestaurant] = TestUtilService
      .makeElementComparable(foundRestaurant, editData,
        ['address', 'roadAddress', 'category', 'createTime']);
    expect(requestRestaurant).toStrictEqual(responseRestaurant);

    await service.leave(accessToken);
  });

  it('Should success editAddress()', async () => {
    const restaurant: { email: string; nickname: string } = {
      email: `3${testUser.email}`, nickname: `${testUser.nickname}_3`,
    };
    await service.checkEmail({ email: restaurant.email });
    await service.create({ ...testUser, ...restaurant });
    const { accessToken }: ResSignIn = await service.signIn({
      email: restaurant.email, password: testUser.password,
    });

    const editData: DtoEditAddress = {
      address: '경기도 어딘가',
      roadAddress: '경기도 어딘가',
    };
    await service.edit(accessToken, editData);

    const foundRestaurant: ResLoadUser = await service.load(accessToken);
    expect(foundRestaurant.roadAddress).toEqual(editData.roadAddress);
    expect(foundRestaurant.address).toEqual(editData.address);

    await service.leave(accessToken);
  });

  it('Should success editPassword()', async () => {
    const restaurant: { email: string; nickname: string } = {
      email: `4${testUser.email}`, nickname: `${testUser.nickname}_4`,
    };
    await service.checkEmail({ email: restaurant.email });
    await service.create({ ...testUser, ...restaurant });
    const { accessToken }: ResSignIn = await service.signIn({
      email: restaurant.email, password: testUser.password,
    });

    await service.checkPassword(accessToken, { password: testUser.password });
    const editData: DtoEditPassword = { password: `${testUser.password}_edit` };
    await service.editPassword(accessToken, editData);

    await service.signIn({ ...editData, email: restaurant.email });

    await service.leave(accessToken);
  });
});
