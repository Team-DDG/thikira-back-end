import { config } from '@app/config';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { TokenModule } from '@app/token';
import { DtoCreateRestaurant, DtoEditAddress, DtoEditPassword, DtoEditRestaurantInfo } from '@app/type/req';
import { ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/type/res';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { RestaurantModule } from './restaurant.module';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let service: RestaurantService;
  const testRestaurant: DtoCreateRestaurant = {
    addParcel: '경기도 이천시 증포동 404-9',
    addStreet: '경기 이천시 아리역로 25 남구빌딩',
    area: '증포동, 창전동',
    category: '치킨',
    closeTime: '00:00',
    dayOff: '주일날은 교회에 갑니다.',
    description: '증포동 bbq 입니다.',
    email: 'restaurant_test@gmail.com',
    image: 'image_url',
    minPrice: 17500,
    name: 'restaurant_test',
    offlinePayment: false,
    onlinePayment: true,
    openTime: '15:00',
    password: 'restaurant_test',
    phone: '01012345678',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RestaurantModule, TestUtilModule, TokenModule,
        TypeOrmModule.forRoot(config.mysqlConfig),
        TypeOrmModule.forRoot(config.mongodbConfig),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UtilModule,
      ],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success refresh()', async () => {
    await service.checkEmail({ email: testRestaurant.email });
    await service.create(testRestaurant);

    const { refreshToken }: ResSignIn = await service.signIn({
      email: testRestaurant.email, password: testRestaurant.password,
    });
    await expect(service.checkEmail({ email: testRestaurant.email })).rejects.toThrow();

    const { accessToken }: ResRefresh = service.refresh(refreshToken);
    await service.leave(accessToken);
  });

  it('Should success editInfo()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `2${testRestaurant.email}`, name: `${testRestaurant.name}_2`,
    };
    await service.checkEmail({ email: restaurant.email });
    await service.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await service.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const editData: DtoEditRestaurantInfo = {
      area: '창전동',
      closeTime: '00:00',
      dayOff: '절에 다닙니다.',
      description: '증포동 bbq 입니다.',
      image: 'url.image',
      minPrice: 20000,
      name: '업체',
      offlinePayment: true,
      onlinePayment: false,
      openTime: '15:00',
      phone: '01012345679',
    };
    await service.edit(accessToken, editData);

    const foundRestaurant: ResLoadRestaurant = await service.load(accessToken);
    const [requestRestaurant, responseRestaurant] = TestUtilService
      .makeElementComparable(foundRestaurant, editData,
        ['addParcel', 'addStreet', 'category', 'createTime', 'email']);
    expect(requestRestaurant).toStrictEqual(responseRestaurant);

    await service.leave(accessToken);
  });

  it('Should success editAddress()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `3${testRestaurant.email}`, name: `${testRestaurant.name}_3`,
    };
    await service.checkEmail({ email: restaurant.email });
    await service.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await service.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const editData: DtoEditAddress = {
      addParcel: '경기도 어딘가',
      addStreet: '경기도 어딘가',
    };
    await service.edit(accessToken, editData);

    const foundRestaurant: ResLoadRestaurant = await service.load(accessToken);
    for (const element of ['addStreet', 'addParcel']) {
      expect(foundRestaurant[element]).toEqual(editData[element]);
    }

    await service.leave(accessToken);
  });

  it('Should success editPassword()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `4${testRestaurant.email}`, name: `${testRestaurant.name}_4`,
    };
    await service.checkEmail({ email: restaurant.email });
    await service.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await service.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    await service.checkPassword(accessToken, { password: testRestaurant.password });
    const editData: DtoEditPassword = { password: `${testRestaurant.password}_edit` };
    await service.editPassword(accessToken, editData);

    await service.signIn({ ...editData, email: restaurant.email });

    await service.leave(accessToken);
  });
});
