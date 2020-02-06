import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import { ResRefresh, ResSignIn, UtilModule } from '@app/util';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let app: INestApplication;
  let service: UserService;
  let access_token: string;
  let refresh_token: string;
  const test_value = {
    nickname: 'test',
    phone: '01012345678',
    add_street: '경기 이천시 아리역로 25 남구빌딩',
    add_parcel: '경기도 이천시 증포동 404-9',
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
    await expect(service.sign_in({ email: test_value.email, password: test_value.password })).rejects.toThrow();
  });

  it('200 check_email()', async () => {
    await service.check_email({ email: test_value.email });
  });

  it('200 sign_up()', async () => {
    await service.create_account({ ...test_value });
  });

  it('409 check_email()', async () => {
    await expect(service.check_email({ email: test_value.email })).rejects.toThrow();
  });

  it('200 sign_in()', async () => {
    const result: ResSignIn = await service.sign_in({ email: test_value.email, password: test_value.password });
    access_token = result.access_token;
    refresh_token = result.refresh_token;
  });

  it('200 refresh()', async () => {
    const result: ResRefresh = await service.refresh(refresh_token);
    access_token = result.access_token;
  });

  it('200 edit_information()', async () => {
    const edit_data = {
      phone: '01012345679',
      nickname: 'test_2',
    };
    await service.edit(access_token, edit_data);
    const found_restaurant = await service.load(access_token);

    Object.keys(edit_data).forEach((value) => {
      if (found_restaurant[value] !== edit_data[value]) {
        console.log('didn\'t edited');
        throw new Error();
      }
    });

  });

  it('200 check_password()', async () => {
    await service.check_password(access_token, { password: test_value.password });
  });

  it('401 check_password()', async () => {
    await expect(service.check_password(access_token, { password: `${test_value.password}1` })).rejects.toThrow();
  });

  it('200 edit_password()', async () => {
    test_value.password = `${test_value.email}1`;
    await service.edit(access_token, { password: test_value.password });
    await service.sign_in({ email: test_value.email, password: test_value.password });
  });

  it('200 leave()', async () => {
    await service.leave(access_token);
  });
});
