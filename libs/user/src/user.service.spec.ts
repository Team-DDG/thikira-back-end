import { ConfigModule, ConfigService } from '@app/config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let app: INestApplication;
  let service: UserService;
  const test_value = {
    image: 'image_url',
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
        UserModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              ...config.ormConfig,
              entities: [User],
            };
          },
        })],
      providers: [
        { provide: UserService, useValue: [new Repository<User>()] },
      ],
    }).compile();

    app = module.createNestApplication();
    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('200 check_email', async () => {
    await service.check_user({ email: test_value.email });
  });
});
