import { ConfigModule, config } from '@app/config';
import { DBModule, mongodb_entities, mysql_entities } from '@app/db';
import { DtoCreateRestaurant, DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption } from '@app/type/req';
import { ResGetGroup, ResGetMenu, ResGetMenuCategory, ResGetOption } from '@app/type/res';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { UtilModule, UtilService } from '@app/util';
import { INestApplication } from '@nestjs/common';
import { MenuModule } from './menu.module';
import { MenuService } from './menu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@app/user';
import { getConnection } from 'typeorm';

describe('MenuService', () => {
  let app: INestApplication;
  let restaurant_token: string;
  let restaurant_service: RestaurantService;
  let service: MenuService;
  const test_restaurant: DtoCreateRestaurant = {
    add_parcel: 'a',
    add_street: 'b',
    area: 'c',
    category: 'menu_test',
    close_time: 'e',
    day_off: 'f',
    description: 'g',
    email: 'menu_test@gmail.com',
    image: 'image.url',
    min_price: 10000,
    name: 'menu_test',
    offline_payment: false,
    online_payment: false,
    open_time: 'i',
    password: 'menu_test',
    phone: '01012345678',
  };
  const test_req: {
    group: DtoUploadGroup[]
    menu: DtoUploadMenu[]
    menu_category: DtoUploadMenuCategory[],
    option: DtoUploadOption[]
  } = {
    group: [
      new DtoUploadGroup({
        m_id: null, max_count: 0, name: 'sauce',
        option: [
          { name: '갈릭소스', price: 500 },
          { name: '양념 소스', price: 500 },
        ],
      }),
      new DtoUploadGroup({
        m_id: null, max_count: 1, name: '매운 정도',
        option: [
          { name: '매운맛', price: 0 },
          { name: '순한맛', price: 0 },
        ],
      }),
      new DtoUploadGroup({ m_id: null, max_count: 0, name: '소스' }),
      new DtoUploadGroup({ m_id: null, max_count: 1, name: '매운 정도' }),
    ],
    menu: [
      new DtoUploadMenu({
        description: '딸기 바나나 멜론맛!',
        group: [{
          max_count: 0, name: '소스',
          option: [
            { name: '갈릭 소스', price: 500 },
            { name: '양념 소스', price: 500 },
          ],
        }, {
          max_count: 1, name: '매운 정도',
          option: [
            { name: '매운맛', price: 0 },
            { name: '순한맛', price: 0 },
          ],
        }],
        image: 'image.url', mc_id: null,
        name: '신호등 치킨', price: 17000,
      }),
      new DtoUploadMenu({
        description: '치즈향 가득~',
        group: [{
          max_count: 0, name: '소스',
          option: [
            { name: '갈릭 소스', price: 500 },
            { name: '양념 소스', price: 500 },
          ],
        }, {
          max_count: 1, name: '매운 정도',
          option: [
            { name: '매운맛', price: 0 },
            { name: '순한맛', price: 0 },
          ],
        }],
        image: 'image.url', mc_id: null,
        name: '쁘링클 치킨', price: 17000,
      }),
      new DtoUploadMenu({
        description: '치즈향 가득~', image: 'image.url',
        mc_id: null, name: '쁘링클 치킨', price: 17000,
      }),
      new DtoUploadMenu({
        description: '딸기 바나나 멜론맛!', image: 'image.url',
        mc_id: null, name: '신호등 치킨', price: 17000,
      }),
    ],
    menu_category: [
      new DtoUploadMenuCategory({ name: 'special chicken' }),
      new DtoUploadMenuCategory({ name: '바베큐 치킨' }),
    ],
    option: [
      new DtoUploadOption({ g_id: null, name: '갈릭 소스', price: 500 }),
      new DtoUploadOption({ g_id: null, name: '양념 소스', price: 500 }),
      new DtoUploadOption({ g_id: null, name: '매운맛', price: 0 }),
      new DtoUploadOption({ g_id: null, name: '순한맛', price: 0 }),
    ],
  };
  const test_res: {
    group: ResGetGroup[],
    menu: ResGetMenu[],
    menu_category: ResGetMenuCategory[],
    option: ResGetOption[]
  } = {
    group: new Array<ResGetGroup>(),
    menu: new Array<ResGetMenu>(),
    menu_category: new Array<ResGetMenuCategory>(),
    option: new Array<ResGetOption>(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DBModule, MenuModule, RestaurantModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          name: 'mysql',
          useFactory() {
            return { ...config.mysql_config, entities: mysql_entities };
          },
        }), TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          name: 'mongodb',
          useFactory() {
            return { ...config.mongodb_config, entities: mongodb_entities };
          },
        }), UserModule, UtilModule],
      providers: [MenuService],
    }).compile();

    app = module.createNestApplication();
    service = module.get<MenuService>(MenuService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);

    await restaurant_service.create(test_restaurant);
    restaurant_token = (await restaurant_service.sign_in({
      email: test_restaurant.email,
      password: test_restaurant.password,
    })).access_token;
  });

  afterAll(async () => {
    await restaurant_service.leave(restaurant_token);
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
    await app.close();
  });

  it('200 upload_menu_category()', async () => {
    for (const loop_menu_category of test_req.menu_category) {
      await service.upload_menu_category(restaurant_token, loop_menu_category);
    }

    test_res.menu_category = await service.get_menu_category_list(restaurant_token);
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
      const found_menus: ResGetMenu[] = await service.get_menu_list({ mc_id: loop_menu_category.mc_id });
      test_res.menu = test_res.menu.concat(found_menus);
    }
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

      for (const index of UtilService.range(test_req.group)) {
        test_req.group[index] = index < 2 ?
          new DtoUploadGroup({ ...test_req.group[index], m_id: test_res.menu[2].m_id })
          : new DtoUploadGroup({ ...test_req.group[index], m_id: test_res.menu[3].m_id });
      }
    }
  });

  it('200 edit_menu()', async () => {
    const edit_data = {
      description: '물참나무 향 솔솔~ 담백한 엉치살 구이',
      name: '스모크 치킨', price: 18000,
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
      const found_groups: ResGetGroup[] = await service.get_group_list({ m_id: test_res.menu[index].m_id });
      test_res.group = test_res.group.concat(found_groups);
    }
    for (const index_2 of UtilService.range(test_res.group)) {
      if (test_req.group[index_2].get() !== test_res.group[index_2].get()) {
        throw new Error();
      }
    }

    for (const index of UtilService.range(test_req.option)) {
      test_req.option[index] = index < 2 ?
        new DtoUploadOption({ ...test_req.option[index], g_id: test_res.group[2].g_id })
        : new DtoUploadOption({ ...test_req.option[index], g_id: test_res.group[3].g_id });
    }
  });

  it('200 edit_group()', async () => {
    const edit_data = { max_count: 0, name: '소스' };
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
      const found_options: ResGetOption[] = await service.get_option_list({ g_id: test_res.group[index].g_id });
      test_res.option = test_res.option.concat(found_options);
    }
    for (const index_2 of UtilService.range(test_res.option)) {
      if (test_req.option[index_2].get() !== test_req.option[index_2].get()) {
        throw new Error();
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
    const o_ids: number[] = new Array<number>();
    for (const loop_option of test_res.option) {
      o_ids.push(loop_option.o_id);
    }
    await service.remove_option(o_ids);

    for (const index of UtilService.range(test_req.option)) {
      const found_option: ResGetOption = await service.get_option(test_res.option[index].o_id);
      if (!found_option.is_empty()) {
        throw new Error();
      }
    }
  });

  it('200 remove_group()', async () => {
    const g_ids: number[] = new Array<number>();
    for (const loop_group of test_res.group) {
      g_ids.push(loop_group.g_id);
    }
    await service.remove_group(g_ids);

    for (const index of UtilService.range(test_req.group)) {
      const found_group: ResGetGroup = await service.get_group(test_res.group[index].g_id);
      if (!found_group.is_empty()) {
        throw new Error();
      }
    }
  });

  it('200 remove_menu()', async () => {
    const m_ids: number[] = new Array<number>();
    for (const loop_menu of test_res.menu) {
      m_ids.push(loop_menu.m_id);
    }
    await service.remove_menu(m_ids);

    for (const index of UtilService.range(test_req.menu)) {
      const found_menu: ResGetMenu = await service.get_menu(test_res.menu[index].m_id);
      if (!found_menu.is_empty()) {
        throw new Error();
      }
    }
  });

  it('200 remove_menu_category()', async () => {
    const mc_ids: number[] = new Array<number>();
    for (const loop_menu_category of test_res.menu_category) {
      mc_ids.push(loop_menu_category.mc_id);
    }
    await service.remove_menu_category(mc_ids);
    for (const loop_menu_category of test_res.menu_category) {
      const found_menu_category: ResGetMenuCategory = await service.get_menu_category(loop_menu_category.mc_id);
      if (!found_menu_category.is_empty()) {
        throw new Error();
      }
    }
  });
});
