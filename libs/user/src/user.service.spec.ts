import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import { ResRefresh, ResSignIn } from '@app/res';
import { UtilModule } from '@app/util';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { stringify } from 'querystring';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let app: INestApplication;
  let service: UserService;
  let access_token: string;
  let refresh_token: string;
  const test_req = {
    nickname: 'test',
    phone: '01012345678',
    email: 'test@gmail.com',
    password: 'test',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule, DBModule, UtilModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              ...config.orm_config,
              entities: [Restaurant, Menu, MenuCategory, Option, Group, User],
            };
          },
        })],
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
      phone: '01012345679',
      nickname: 'test_2',
    };
    await service.edit_info(access_token, edit_data);
    const found_user = await service.get(access_token);

    if (found_user.get_info() !== stringify(edit_data)) {
      throw new Error();
    }
  });

  it('200 edit_address()', async () => {
    const edit_data = {
      add_street: '경기도 어딘가',
      add_parcel: '경기도 어딘가',
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
