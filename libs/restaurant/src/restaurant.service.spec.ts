import { MongoModule, MongoService } from '@app/mongo';
import { ResRefresh, ResSignIn, UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let mongo: MongoService;
  const testValue = {
    image: 'image_url',
    name: 'test',
    phone: '01012345678',
    add_street: '경기 이천시 아리역로 25 남구빌딩',
    add_parcel: '경기도 이천시 증포동 404-9',
    area: [
      '증포동',
      '창전동',
    ],
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
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongoModule, UtilModule],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    mongo = module.get<MongoService>(MongoService);
  });

  afterAll(async () => {
    await mongo.close();
  });

  it('404 sign_in()', async () => {
    await expect(service.sign_in({ email: testValue.email, password: testValue.password })).rejects.toThrow();
  });

  it('200 check_email()', async () => {
    await service.check_email({ email: testValue.email });
  });

  it('200 sign_up()', async () => {
    await service.sign_up({ ...testValue });
  });

  it('409 check_email()', async () => {
    await expect(service.check_email({ email: testValue.email })).rejects.toThrow();
  });

  it('200 sign_in()', async () => {
    const result: ResSignIn = await service.sign_in({ email: testValue.email, password: testValue.password });
    accessToken = result.accessToken;
    refreshToken = result.refreshToken;
  });

  it('200 refresh()', async () => {
    const result: ResRefresh = await service.refresh(refreshToken);
    accessToken = result.accessToken;
  });

  it('200 leave()', async () => {
    await service.leave(accessToken);
  });
});
