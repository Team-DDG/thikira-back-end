import { ConfigModule, config } from '@app/config';
import { DBModule, mysql_entities } from '@app/db';
import { ResRefresh, ResSignIn } from '@app/res';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { UtilModule } from '@app/util';
import { stringify } from 'querystring';

describe('UserService', () => {
  let access_token: string;
  let app: INestApplication;
  let refresh_token: string;
  let service: UserService;
  const test_req = {
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
          useFactory() {
            return { ...config.orm_config, entities: mysql_entities };
          },
        }), UserModule, UtilModule],
      providers: [UserService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<UserService>(UserService);
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
    await service.create_user(test_req);
  });

  it('409 sign_up()', async () => {
    await expect(service.create_user(test_req)).rejects.toThrow();
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
      nickname: 'test_2',
      phone: '01012345679',
    };
    await service.edit_info(access_token, edit_data);
    const found_user = await service.get(access_token);

    if (found_user.get_info() !== stringify(edit_data)) {
      throw new Error();
    }
  });

  it('200 edit_address()', async () => {
    const edit_data = {
      add_parcel: '경기도 어딘가',
      add_street: '경기도 어딘가',
    };
    await service.edit_address(access_token, edit_data);
    const found_user = await service.get(access_token);
    if (found_user.get_address() !== stringify(edit_data)) {
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
    test_req.password = `${test_req.email}1`;
    await service.edit_password(access_token, { password: test_req.password });
    await service.sign_in({ email: test_req.email, password: test_req.password });
  });

  it('200 leave()', async () => {
    await service.leave(access_token);
  });
});
