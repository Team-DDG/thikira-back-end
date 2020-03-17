import { ConfigModule, config } from '@app/config';
import { DBModule, mongodb_entities, mysql_entities } from '@app/db';
import { DtoCreateUser, DtoEditAddress, DtoEditUserInfo } from '@app/type/req';
import { ResLoadUser, ResRefresh, ResSignIn } from '@app/type/res';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { UtilModule } from '@app/util';
import { classToPlain } from 'class-transformer';
import { getConnection } from 'typeorm';

describe('UserService', () => {
  let access_token: string;
  let refresh_token: string;
  let service: UserService;
  const test_req: DtoCreateUser = {
    email: 'user_test@gmail.com',
    nickname: 'user_test',
    password: 'user_test',
    phone: '01012345678',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DBModule, TypeOrmModule.forRootAsync({
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
        }), UserModule, UtilModule],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);

    await service.create(test_req);
  });

  afterAll(async () => {
    await service.leave(access_token);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('409 check_email()', async () => {
    await expect(service.check_email({ email: test_req.email })).rejects.toThrow();
  });

  it('200 sign_in()', async () => {
    const res: ResSignIn = await service.sign_in({ email: test_req.email, password: test_req.password });
    access_token = res.access_token;
    refresh_token = res.refresh_token;
  });

  it('200 refresh()', () => {
    const res: ResRefresh = service.refresh(refresh_token);
    access_token = res.access_token;
  });

  it('Should fail check_email()', async () => {
    await expect(service.check_email({ email: test_req.email })).rejects.toThrow();
  });

  it('Should success edit_info()', async () => {
    const edit_data: DtoEditUserInfo = {
      nickname: 'test_2',
      phone: '01012345679',
    };
    await service.edit(access_token, edit_data);
    const f_u: ResLoadUser = await service.get(access_token);
    ['add_parcel', 'add_street', 'create_time'].map((e) => {
      Reflect.deleteProperty(f_u, e);
    });
    expect(classToPlain(f_u)).toStrictEqual(classToPlain(edit_data));
  });

  it('Should success edit_address()', async () => {
    const edit_data: DtoEditAddress = {
      add_parcel: '경기도 어딘가',
      add_street: '경기도 어딘가',
    };
    await service.edit(access_token, edit_data);
    const f_u: ResLoadUser = await service.get(access_token);
    if (edit_data.add_street !== f_u.add_street ||
      edit_data.add_parcel !== f_u.add_parcel) {
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
