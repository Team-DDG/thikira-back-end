import { ConfigModule, ConfigService } from '@app/config';
import { Restaurant, RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createConnection, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let restaurantService: RestaurantService;
  let configService: ConfigService;
  const test_value = {
    email: 'test@gmail.com',
    phone: '01012345678',
    add_street: '경기 이천시 아리역로 25 남구빌딩',
    add_parcel: '경기도 이천시 증포동 404-9',
    password: 'test',
    nickname: 'test',
    create_time: new Date().toISOString(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule, RestaurantModule, UserModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              ...config.ormConfig,
              entities: [
                Restaurant, User,
              ],
            };
          },
        })],
      providers: [
        { provide: UserService, useValue: [new Repository<User>()] },
        { provide: RestaurantService, useValue: [new Repository<Restaurant>()] },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    const mysqlConnection = await createConnection({
      ...configService.ormConfig,
      entities: [
        Restaurant, User,
      ],
    });
    await mysqlConnection.close();
  });

  it('200 check_email', () => {
    service.check_email({ email: test_value.email });
  });
});
