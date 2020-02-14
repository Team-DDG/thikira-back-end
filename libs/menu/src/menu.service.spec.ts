import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import { DtoCreateRestaurant, DtoCreateUser, DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption } from '@app/dto';
import { ResGetGroup, ResGetMenu, ResGetMenuCategory, ResGetOption } from '@app/res';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { UserModule, UserService } from '@app/user';
import { UtilModule, UtilService } from '@app/util';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuModule } from './menu.module';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let app: INestApplication;
  let service: MenuService;
  let restaurant_service: RestaurantService;
  let user_service: UserService;
  let user_access_token: string;
  let restaurant_access_token: string;
  const test_user: DtoCreateUser = {
    email: 'menu_test@gmail.com',
    password: 'menu_test',
    nickname: 'menu_test',
    phone: '01012345678',
  };
  const test_restaurant: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
    area: 'c',
    category: 'd',
    close_time: 'e',
    day_off: 'f',
    description: 'g',
    image: 'image.url',
    min_price: 10000,
    name: 'h',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    phone: 'j',
    email: 'test_fixed@gmail.com',
    password: 'test_fixed',
  };
  let test_req: {
    menu_category: DtoUploadMenuCategory[],
    menu: DtoUploadMenu[]
    group: DtoUploadGroup[]
    option: DtoUploadOption[]
  } = {
    menu_category: [
      new DtoUploadMenuCategory({ name: 'special chicken' }),
      new DtoUploadMenuCategory({ name: '바베큐 치킨' }),
    ],
    menu: [
      new DtoUploadMenu({
        mc_id: null, name: '신호등 치킨', price: 17000,
        description: '딸기 바나나 멜론맛!', image: 'image.url',
        group: [{
          name: 'sauce', max_count: 0,
          option: [
            { name: '갈릭 소스', price: 500 },
            { name: '양념 소스', price: 500 },
          ],
        }, {
          name: '매운 정도', max_count: 0,
          option: [
            { name: '매운맛', price: 0 },
            { name: '순한맛', price: 0 },
          ],
        }],
      }),
      new DtoUploadMenu({
        mc_id: null, name: '쁘링클 치킨', price: 17000,
        description: '치즈향 가득~', image: 'image.url',
        group: [{
          name: '소스', max_count: 0,
          option: [
            { name: '갈릭 소스', price: 500 },
            { name: '양념 소스', price: 500 },
          ],
        }, {
          name: '매운 정도', max_count: 0,
          option: [
            { name: '매운맛', price: 0 },
            { name: '순한맛', price: 0 }],
        }],
      }),
      new DtoUploadMenu({
        mc_id: null, name: '쁘링클 치킨', price: 17000,
        description: '치즈향 가득~', image: 'image.url',
      }),
      new DtoUploadMenu({
        mc_id: null, name: '신호등 치킨', price: 17000,
        description: '딸기 바나나 멜론맛!', image: 'image.url',
      }),
    ],
    group: [
      new DtoUploadGroup({
        m_id: null, name: '소스',
        max_count: 0, option: [
          { name: '갈릭소스', price: 500 },
          { name: '양념 소스', price: 500 },
        ],
      }),
      new DtoUploadGroup({
        m_id: null, name: '매운 정도',
        max_count: 0, option: [
          { name: '매운맛', price: 0 },
          { name: '순한맛', price: 0 },
        ],
      }),
      new DtoUploadGroup({ m_id: null, name: '소스', max_count: 0 }),
      new DtoUploadGroup({ m_id: null, name: '매운 정도', max_count: 0 }),
    ],
    option: [
      new DtoUploadOption({ g_id: null, name: '갈릭 소스', price: 500 }),
      new DtoUploadOption({ g_id: null, name: '양념 소스', price: 500 }),
      new DtoUploadOption({ g_id: null, name: '매운맛', price: 0 }),
      new DtoUploadOption({ g_id: null, name: '순한맛', price: 0 }),
    ],
  };
  let test_res: {
    menu_category: ResGetMenuCategory[],
    menu: ResGetMenu[],
    group: ResGetGroup[],
    option: ResGetOption[]
  } = {
    menu_category: new Array<ResGetMenuCategory>(),
    menu: new Array<ResGetMenu>(),
    group: new Array<ResGetGroup>(),
    option: new Array<ResGetOption>(),
  };

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

    restaurant_service = module.get<RestaurantService>(RestaurantService);
    await restaurant_service.create_restaurant(test_restaurant);
    restaurant_access_token = (await restaurant_service.sign_in({
      email: test_restaurant.email,
      password: test_restaurant.password,
    })).access_token;

    user_service = module.get<UserService>(UserService);
    await user_service.create_user(test_user);
    user_access_token = (await user_service.sign_in({
      email: test_user.email,
      password: test_user.password,
    })).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('200 upload_menu_category()', async () => {
    for (const loop_menu_category of test_req.menu_category) {
      await service.upload_menu_category(restaurant_access_token, loop_menu_category);
    }

    test_res.menu_category = await service.get_menu_category_list(restaurant_access_token);
    for (const index of UtilService.range(test_res.menu_category)) {
      if (test_req.menu_category[index].get() !== test_res.menu_category[index].get()) {
        throw new Error();
      }
    }

    for (const index of UtilService.range(test_req.menu)) {
      test_req.menu[index] = index < 2 ?
        new DtoUploadMenu({
          ...test_req.menu[index],
          mc_id: test_res.menu_category[0].mc_id,
        })
        : new DtoUploadMenu({
          ...test_req.menu[index],
          mc_id: test_res.menu_category[1].mc_id,
        });
    }
  });

  it('200 edit_menu_category()', async () => {
    const edit_data = { name: '스페셜 치킨' };
    test_req.menu_category[0] = new DtoUploadMenuCategory({ ...test_req.menu_category[0], ...edit_data });
    await service.edit_menu_category({ ...edit_data, mc_id: test_res.menu_category[0].mc_id });

    test_res.menu_category[0] = await service.get_menu_category(test_res.menu_category[0].mc_id);
    if (test_req.menu_category[0].get() !== test_res.menu_category[0].get()) {
      throw new Error();
    }
  });

  it('200 upload_menu()', async () => {
    for (const loop_menu of test_req.menu) {
      await service.upload_menu(loop_menu);
    }
    for (const loop_menu_category of test_res.menu_category) {
      const found_menus = await service.get_menu_list({ mc_id: loop_menu_category.mc_id });
      test_res.menu = test_res.menu.concat(found_menus);
    }
    for (const loop_menu_category of test_res.menu_category) {
      for (const index of UtilService.range(test_res.menu)) {
        if (test_req.menu[index].get() !== test_res.menu[index].get()) {
          throw new Error();
        }
        for (const index_2 of UtilService.range(test_res.group)) {
          if (test_req.menu[index].group[index_2].get()
            !== test_res.menu[index].group[index_2].get()) {
            throw new Error();
          }
          for (const index_3 of UtilService.range(test_res.option)) {
            if (test_req.menu[index].group[index_2].option[index_3].get()
              !== test_res.menu[index].group[index_2].option[index_3].get()) {
              throw new Error();
            }
          }
        }
      }

      for (const index of UtilService.range(test_req.group)) {
        test_req.group[index] = index < 2 ?
          new DtoUploadGroup({ ...test_req.group[index], m_id: test_res.menu[2].m_id })
          : new DtoUploadGroup({ ...test_req.group[index], m_id: test_res.menu[3].m_id });
      }
    }
  });

  it('200 edit_menu()', async () => {
    const edit_data = {
      name: '스모크 치킨', price: 18000,
      description: '물참나무 향 솔솔~ 담백한 엉치살 구이',
    };
    test_req.menu[0] = new DtoUploadMenu({ ...test_req.menu[0], ...edit_data });
    await service.edit_menu({ m_id: test_res.menu[0].m_id, ...edit_data });

    test_res.menu[0] = await service.get_menu(test_res.menu[0].m_id);
    if (test_req.menu[0].get() !== test_res.menu[0].get()) {
      throw new Error();
    }
  });

  it('200 upload_group()', async () => {
    for (const loop_group of test_req.group) {
      await service.upload_group(loop_group);
    }

    for (const index of [2, 3]) {
      const found_groups = await service.get_group_list({ m_id: test_res.menu[index].m_id });
      test_res.group = test_res.group.concat(found_groups);
    }
    for (const index of [2, 3]) {
      for (const index_2 of UtilService.range(test_res.group)) {
        if (test_req.group[index_2].get() !== test_res.group[index_2].get()) {
          throw new Error();
        }
      }
    }

    for (const index of UtilService.range(test_req.option)) {
      test_req.option[index] = index < 2 ?
        new DtoUploadOption({ ...test_req.option[index], g_id: test_res.group[2].g_id })
        : new DtoUploadOption({ ...test_req.option[index], g_id: test_res.group[3].g_id });
    }
  });

  it('200 edit_group()', async () => {
    const edit_data = { name: '소스', max_count: 0 };
    test_req.group[0] = new DtoUploadGroup({ ...test_req.group[0], ...edit_data });
    await service.edit_group({ g_id: test_res.group[0].g_id, ...edit_data });

    test_res.group[0] = await service.get_group(test_res.group[0].g_id);
    if (test_req.group[0].get() !== test_res.group[0].get()) {
      throw new Error();
    }
  });

  it('200 upload_option()', async () => {
    for (const loop_option of test_req.option) {
      await service.upload_option(loop_option);
    }
    for (const index of [2, 3]) {
      test_res.option = test_res.option.concat(await service.get_option_list({ g_id: test_res.group[index].g_id }));
      for (const index_2 of UtilService.range(test_res.option)) {
        if (test_req.option[index_2].get() !== test_req.option[index_2].get()) {
          throw new Error();
        }
      }
    }
  });

  it('200 edit_option()', async () => {
    const edit_data = { name: '어니언 소스', price: 400 };
    test_req.option[0] = new DtoUploadOption({ ...test_req.option[0], ...edit_data });
    await service.edit_option({ o_id: test_res.option[0].o_id, ...edit_data });

    test_res.option[0] = await service.get_option(test_res.option[0].o_id);
    if (test_req.option[0].get() !== test_res.option[0].get()) {
      throw new Error();
    }
  });

  it('200 remove_option()', async () => {
    for (const index of UtilService.range(test_req.option)) {
      await service.remove_option({ o_id: test_res.option[index].o_id });
      const found_option: ResGetOption = await service.get_option(test_res.option[index].o_id);
      if (!found_option.is_empty()) {
        throw new Error();
      }
    }
  });

  it('200 remove_group()', async () => {
    for (const index of UtilService.range(test_req.group)) {
      await service.remove_group({ g_id: test_res.group[index].g_id });
      const found_group: ResGetGroup = await service.get_group(test_res.group[index].g_id);
      if (!found_group.is_empty()) {
        throw new Error();
      }
    }
  });

  it('200 remove_menu()', async () => {
    for (const index of UtilService.range(test_req.menu)) {
      await service.remove_menu({ m_id: test_res.menu[index].m_id });
      const found_menu: ResGetMenu = await service.get_menu(test_res.menu[index].m_id);
      if (!found_menu.is_empty()) {
        throw new Error();
      }
    }
  });

  it('200 remove_menu_category()', async () => {
    for (const index of UtilService.range(test_req.menu_category)) {
      await service.remove_menu_category({ mc_id: test_res.menu_category[index].mc_id });
      const found_menu_category: ResGetMenuCategory = await service.get_menu_category(test_res.menu_category[index].mc_id);
      if (!found_menu_category.is_empty()) {
        throw new Error();
      }
    }
  });
});
