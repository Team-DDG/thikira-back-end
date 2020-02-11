import { ConfigModule, ConfigService } from '@app/config';
import { DBModule, Group, Menu, MenuCategory, Option, Restaurant, User } from '@app/db';
import {
  DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
  MenuModule, MenuService,
  ResGetGroup, ResGetMenuCategory, ResGetMenu, ResGetOption,
} from '@app/menu';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { UserModule, UserService } from '@app/user';
import { UtilModule, UtilService } from '@app/util';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { errorObject } from 'rxjs/internal-compatibility';

describe('MenuService', () => {
  let app: INestApplication;
  let service: MenuService;
  let user_access_token: string;
  let restaurant_access_token: string;
  let test_account = {
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
      { name: 'special chicken' },
      { name: '바베큐 치킨' },
    ],
    menu: [
      {
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
      },
      {
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
      },
      {
        mc_id: null, name: '신호등 치킨', price: 17000,
        description: '딸기 바나나 멜론맛!', image: 'image.url',
      },
      {
        mc_id: null, name: '쁘링클 치킨', price: 17000,
        description: '치즈향 가득~', image: 'image.url',
      },
    ],
    group: [
      {
        m_id: null, name: '소스',
        max_count: 0, option: [
          { name: '갈릭소스', price: 500 },
          { name: '양념 소스', price: 500 },
        ],
      },
      {
        m_id: null, name: '매운 정도',
        max_count: 0, option: [
          { name: '매운맛', price: 0 },
          { name: '순한맛', price: 0 },
        ],
      },
      { m_id: null, name: '소스', max_count: 0 },
      { m_id: null, name: '매운 정도', max_count: 0 },
    ],
    option: [
      { g_id: null, name: '갈릭 소스', price: 500 },
      { g_id: null, name: '양념 소스', price: 500 },
      { g_id: null, name: '매운맛', price: 0 },
      { g_id: null, name: '순한맛', price: 0 },
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

    const restaurant_service = module.get<RestaurantService>(RestaurantService);
    restaurant_access_token = (await restaurant_service.sign_in(test_account)).access_token;

    const user_service = module.get<UserService>(UserService);
    user_access_token = (await user_service.sign_in(test_account)).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('200 upload_menu_category()', async () => {
    for (const loop_menu_category of test_req.menu_category) {
      await service.upload_menu_category(restaurant_access_token, loop_menu_category);
    }
    test_res.menu_category = await service.get_menu_category_list(restaurant_access_token);
    for (const index of UtilService.range(test_res.menu_category.length)) {
      if (test_req.menu_category[index].name !== test_res.menu_category[index].name) {
        throw new errorObject();
      }
    }
    for (const index of UtilService.range(test_req.menu.length)) {
      if (index < 2) {
        test_req.menu[index] = { ...test_req.menu[index], mc_id: test_res.menu_category[0].mc_id };
      } else {
        test_req.menu[index] = { ...test_req.menu[index], mc_id: test_res.menu_category[1].mc_id };
      }
    }
  });

  it('200 edit_menu_category()', async () => {
    const edit_data = { name: '스페셜 치킨' };
    test_req.menu_category[0] = { ...test_req.menu_category[0], ...edit_data };
    await service.edit_menu_category(restaurant_access_token, {
      mc_id: test_res.menu_category[0].mc_id,
      ...edit_data,
    });
    test_res.menu_category[0] = await service.get_menu_category(test_res.menu_category[0].mc_id);
    if (test_req.menu_category[0].name !== test_res.menu_category[0].name) {
      throw new errorObject();
    }
  });

  it('200 upload_menu()', async () => {
    for (const loop_menu of test_req.menu) {
      await service.upload_menu(loop_menu);
    }
    for (const loop_menu_category of test_res.menu_category) {
      test_res.menu = test_res.menu.concat(await service.get_menu_list({ mc_id: loop_menu_category.mc_id }));
      test_res.menu.forEach((loop_menu, index) => {
        if (loop_menu.name !== test_req.menu[index].name ||
          loop_menu.description !== test_req.menu[index].description ||
          loop_menu.image !== test_req.menu[index].image ||
          loop_menu.price !== test_req.menu[index].price) {
          throw new errorObject();
        }
        loop_menu.group.forEach((loop_group, index_2) => {
          if (loop_group.name !== test_req.menu[index].group[index_2].name ||
            loop_group.max_count !== test_req.menu[index].group[index_2].max_count) {
            throw new errorObject();
          }
          loop_group.option.forEach((loop_option, index_3) => {
            if (loop_option.name !== test_req.menu[index].group[index_2].option[index_3].name ||
              loop_option.price !== test_req.menu[index].group[index_2].option[index_3].price) {
              throw new errorObject();
            }
          });
        });
      });
    }
    for (const index of UtilService.range(test_req.group.length)) {
      if (index < 2) {
        test_req.group[index] = { ...test_req.group[index], m_id: test_res.menu[2].m_id };
      } else {
        test_req.group[index] = { ...test_req.group[index], m_id: test_res.menu[3].m_id };
      }
    }
  });

  it('200 edit_menu()', async () => {
    const edit_data = { name: '스모크 치킨', price: 18000, description: '물참나무 향 솔솔~ 담백한 엉치살 구이' };
    test_req.menu[0] = { ...test_req.menu[0], ...edit_data };
    await service.edit_menu({ m_id: test_res.menu[0].m_id, ...edit_data });
    test_res.menu[0] = await service.get_menu(test_res.menu[0].m_id);
    if (test_res.menu[0].name !== test_req.menu[0].name ||
      test_res.menu[0].description !== test_req.menu[0].description ||
      test_res.menu[0].image !== test_req.menu[0].image ||
      test_res.menu[0].price !== test_req.menu[0].price) {
      throw new errorObject();
    }
  });

  it('200 upload_group()', async () => {
    for (const loop_group of test_req.group) {
      await service.upload_group(loop_group);
    }
    for (const index of UtilService.range_start_end(2, 3)) {
      test_res.group = test_res.group.concat(await service.get_group_list({ m_id: test_res.menu[index].m_id }));
      test_res.group.forEach((loop_group, index_2) => {
        if (loop_group.name !== test_req.group[index_2].name ||
          loop_group.max_count !== test_req.group[index_2].max_count) {
          throw new errorObject();
        }
      });
    }
    for (const index of UtilService.range(test_req.option.length)) {
      if (index < 2) {
        test_req.option[index] = { ...test_req.option[index], g_id: test_res.group[2].g_id };
      } else {
        test_req.option[index] = { ...test_req.option[index], g_id: test_res.group[3].g_id };
      }
    }
  });

  it('200 edit_group()', async () => {
    const edit_data = { name: '소스', max_count: 0 };
    test_req.group[0] = { ...test_req.group[0], ...edit_data };
    await service.edit_group({ g_id: test_res.group[0].g_id, ...edit_data });
    test_res.group[0] = await service.get_group(test_res.group[0].g_id);
    if (test_res.group[0].name !== test_req.group[0].name ||
      test_res.group[0].max_count !== test_req.group[0].max_count) {
      throw new errorObject();
    }
  });

  it('200 upload_option()', async () => {
    for (const loop_option of test_req.option) {
      await service.upload_option(loop_option);
    }
    for (const index of UtilService.range_start_end(2, 3)) {
      test_res.option = test_res.option.concat(await service.get_option_list({ g_id: test_res.group[index].g_id }));
      test_res.option.forEach((loop_option, index_2) => {
        if (loop_option.name !== test_req.option[index_2].name ||
          loop_option.price !== test_req.option[index_2].price) {
          throw new errorObject();
        }
      });
    }
  });

  it('200 edit_option()', async () => {
    const edit_data = { name: '어니언 소스', price: 400 };
    test_req.option[0] = { ...test_req.option[0], ...edit_data };
    await service.edit_option({ o_id: test_res.option[0].o_id, ...edit_data });
    test_res.option[0] = await service.get_option(test_res.option[0].o_id);
    if (test_res.option[0].name !== test_req.option[0].name ||
      test_res.option[0].price !== test_req.option[0].price) {
      throw new errorObject();
    }
  });

  it('200 remove_option()', async () => {
    for (const index of UtilService.range(test_req.option.length)) {
      await service.remove_option({ o_id: test_res.option[index].o_id });
      if ((await service.get_option(test_res.option[index].o_id)).o_id !== undefined) {
        throw new errorObject();
      }
    }
  });

  it('200 remove_group()', async () => {
    for (const index of UtilService.range(test_req.group.length)) {
      await service.remove_group({ g_id: test_res.group[index].g_id });
      if ((await service.get_group(test_res.group[index].g_id)).g_id !== undefined) {
        throw new errorObject();
      }
    }
  });

  it('200 remove_menu()', async () => {
    for (const index of UtilService.range(test_req.menu.length)) {
      await service.remove_menu({ m_id: test_res.menu[index].m_id });
      if ((await service.get_menu(test_res.menu[index].m_id)).m_id !== undefined) {
        throw new errorObject();
      }
    }
  });

  it('200 remove_menu_category()', async () => {
    for (const index of UtilService.range(test_req.menu_category.length)) {
      await service.remove_menu_category({ mc_id: test_res.menu_category[index].mc_id });
      if ((await service.get_menu_category(test_res.menu_category[index].mc_id)).mc_id !== undefined) {
        throw new errorObject();
      }
    }
  });
});
