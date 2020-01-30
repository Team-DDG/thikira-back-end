import { ConfigModule, ConfigService } from '@app/config';
import { ResRefresh, ResSignIn } from '@app/util';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { RestaurantModule } from './restaurant.module';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let app: INestApplication;
  let service: RestaurantService;
  let access_token: string;
  let refresh_token: string;
  const test_value = {
    image: 'image_url',
    name: 'test',
    phone: '01012345678',
    add_street: '경기 이천시 아리역로 25 남구빌딩',
    add_parcel: '경기도 이천시 증포동 404-9',
    area: '증포동, 창전동',
    category: '치킨',
    min_price: 17500,
    day_off: '주일날은 교회에 갑니다.',
    online_payment: true,
    offline_payment: false,
    open_time: '15:00',
    close_time: '00:00',
    description: '증포동 bbq 입니다.',
    email: 'test@gmail.com',
    password: 'test',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RestaurantModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              ...config.ormConfig,
              entities: [Restaurant],
            };
          },
        })],
      providers: [
        { provide: RestaurantService, useValue: [new Repository<Restaurant>()] },
      ],
    }).compile();

    app = module.createNestApplication();
    service = module.get<RestaurantService>(RestaurantService);
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
    await service.sign_up({ ...test_value });
  });

  it('409 check_email()', async () => {
    await expect(service.check_email({ email: test_value.email })).rejects.toThrow();
  });

  it('200 sign_in()', async () => {
    const result: ResSignIn = await service.sign_in({ email: test_value.email, password: test_value.password });
    access_token = result.accessToken;
    refresh_token = result.refreshToken;
  });

  it('200 refresh()', async () => {
    const result: ResRefresh = await service.refresh(refresh_token);
    access_token = result.accessToken;
  });

  it('200 edit_information()', async () => {
    const edit_data = {
      phone: '01012345679',
      area: '창전동',
      min_price: 20000,
      day_off: '절에 다닙니다.',
      online_payment: false,
      offline_payment: true,
      open_time: '15:00',
      close_time: '00:00',
      description: '증포동 bbq 입니다.',
    };
    await service.edit(access_token, edit_data);
    const found_restaurant = await service.load(access_token);

    Object.keys(edit_data).forEach((value) => {
      if (value === 'area') {
        if (JSON.stringify(found_restaurant[value]) !== JSON.stringify(edit_data[value])) {
          throw new InternalServerErrorException();
        }
      } else if (found_restaurant[value] !== edit_data[value]) {
        throw new InternalServerErrorException();
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
