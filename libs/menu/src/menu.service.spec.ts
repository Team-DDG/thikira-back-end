import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import { MenuModule, MenuService, ResGetMenuCategory } from '@app/menu';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { UserModule, UserService } from '@app/user';
import { UtilModule } from '@app/util';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('MenuService', () => {
  let app: INestApplication;
  let service: MenuService;
  let user_access_token: string;
  let restaurant_access_token: string;
  let test_value = {
    account: {
      email: 'test_fixed@gmail.com',
      password: 'test_fixed',
    },
    category: {
      name: '치킨',
    },
  };
  let menu_category_list: ResGetMenuCategory[];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MenuModule, RestaurantModule, UserModule, DBModule, UtilModule,
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
      providers: [MenuService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<MenuService>(MenuService);

    const restaurant_service = module.get<RestaurantService>(RestaurantService);
    restaurant_access_token = (await restaurant_service.sign_in(test_value.account)).access_token;

    const user_service = module.get<UserService>(UserService);
    user_access_token = (await user_service.sign_in(test_value.account)).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('200 upload_menu_category()', async () => {
    await service.upload_menu_category(restaurant_access_token, test_value.category);
  });

  it('200 get_menu_category_list()', async () => {
    menu_category_list = await service.get_menu_category_list(restaurant_access_token);
  });

  it('200 edit_menu_category()', async () => {
    test_value.category.name = '피자';
    await service.edit_menu_category(
      restaurant_access_token,
      { menu_category_id: menu_category_list[0].menu_category_id, name: test_value.category.name },
    );
  });

  it('200 remove_menu_category()', async () => {
    for(const loop_menu_category of menu_category_list) {
      await service.remove_menu_category(loop_menu_category);
    }
  });
});
