import { DtoCreateUser, DtoEditAddress, DtoEditPassword, DtoEditUserInfo } from '@app/type/req';
import { ResLoadUser, ResRefresh, ResSignIn } from '@app/type/res';
import { Test, TestingModule } from '@nestjs/testing';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { mongodb_entities, mysql_entities } from '@app/entity';
import { RestaurantModule } from '@app/restaurant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { UtilModule } from '@app/util';
import { config } from '@app/config';
import { getConnection } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  const test_u: DtoCreateUser = {
    email: 'user_test@gmail.com',
    nickname: 'user_test',
    password: 'user_test',
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
    await service.check_email({ email: test_u.email });
    await service.create(test_u);
    const { refresh_token }: ResSignIn = await service.sign_in({
      email: test_u.email, password: test_u.password,
    });
    await expect(service.check_email({ email: test_u.email })).rejects.toThrow();

    const { access_token }: ResRefresh = service.refresh(refresh_token);
    await service.leave(access_token);
  });

  it('Should success edit_info()', async () => {
    const restaurant: { email: string; nickname: string } = {
      email: `2${test_u.email}`, nickname: `${test_u.nickname}_2`,
    };
    await service.check_email({ email: restaurant.email });
    await service.create({ ...test_u, ...restaurant });
    const { access_token }: ResSignIn = await service.sign_in({
      email: restaurant.email, password: test_u.password,
    });

    const edit_data: DtoEditUserInfo = {
      nickname: '업체',
      phone: '01012345679',
    };
    await service.edit(access_token, edit_data);

    const f_restaurant: ResLoadUser = await service.load(access_token);
    const [req_r, res_r] = TestUtilService.make_comparable(f_restaurant, edit_data, [
      'add_parcel', 'add_street', 'category', 'create_time',
    ]);
    expect(req_r).toStrictEqual(res_r);

    await service.leave(access_token);
  });

  it('Should success edit_address()', async () => {
    const restaurant: { email: string; nickname: string } = {
      email: `3${test_u.email}`, nickname: `${test_u.nickname}_3`,
    };
    await service.check_email({ email: restaurant.email });
    await service.create({ ...test_u, ...restaurant });
    const { access_token }: ResSignIn = await service.sign_in({
      email: restaurant.email, password: test_u.password,
    });

    const edit_data: DtoEditAddress = {
      add_parcel: '경기도 어딘가',
      add_street: '경기도 어딘가',
    };
    await service.edit(access_token, edit_data);

    const f_restaurant: ResLoadUser = await service.load(access_token);
    expect(f_restaurant.add_street).toEqual(edit_data.add_street);
    expect(f_restaurant.add_parcel).toEqual(edit_data.add_parcel);

    await service.leave(access_token);
  });

  it('Should success edit_password()', async () => {
    const restaurant: { email: string; nickname: string } = {
      email: `4${test_u.email}`, nickname: `${test_u.nickname}_4`,
    };
    await service.check_email({ email: restaurant.email });
    await service.create({ ...test_u, ...restaurant });
    const { access_token }: ResSignIn = await service.sign_in({
      email: restaurant.email, password: test_u.password,
    });

    await service.check_password(access_token, { password: test_u.password });
    const edit_data: DtoEditPassword = { password: `${test_u.password}_edit` };
    await service.edit_password(access_token, edit_data);

    await service.sign_in({ ...edit_data, email: restaurant.email });

    await service.leave(access_token);
  });
});
