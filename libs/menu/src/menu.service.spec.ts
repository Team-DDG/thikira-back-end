import { ConfigModule, config } from '@app/config';
import { DBModule, mongodb_entities, mysql_entities } from '@app/db';
import {
  DtoCreateRestaurant,
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption,
  DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
} from '@app/type/req';
import { ResGetGroupList, ResGetMenuCategoryList, ResGetMenuList, ResGetOptionList } from '@app/type/res';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { UtilModule, UtilService } from '@app/util';
import { MenuModule } from './menu.module';
import { MenuService } from './menu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@app/user';
import { getConnection } from 'typeorm';

describe('MenuService', () => {
  let r_token: string;
  let r_service: RestaurantService;
  let service: MenuService;
  const test_r: DtoCreateRestaurant = {
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
    g: DtoUploadGroup[];
    m: DtoUploadMenu[];
    mc: DtoUploadMenuCategory[];
    o: DtoUploadOption[];
  } = {
    g: [
      {
        m_id: null, max_count: 0, name: 'sauce',
        o: [
          { name: '갈릭소스', price: 500 },
          { name: '양념 소스', price: 500 },
        ],
      }, {
        m_id: null, max_count: 1, name: '매운 정도',
        o: [
          { name: '매운맛', price: 0 },
          { name: '순한맛', price: 0 },
        ],
      },
      { m_id: null, max_count: 0, name: '소스' },
      { m_id: null, max_count: 1, name: '매운 정도' },
    ],
    m: [
      {
        description: '딸기 바나나 멜론맛!',
        g: [{
          max_count: 0, name: '소스',
          o: [
            { name: '갈릭 소스', price: 500 },
            { name: '양념 소스', price: 500 },
          ],
        }, {
          max_count: 1, name: '매운 정도',
          o: [
            { name: '매운맛', price: 0 },
            { name: '순한맛', price: 0 },
          ],
        }],
        image: 'image.url', mc_id: null,
        name: '신호등 치킨', price: 17000,
      }, {
        description: '치즈향 가득~',
        g: [{
          max_count: 0, name: '소스',
          o: [
            { name: '갈릭 소스', price: 500 },
            { name: '양념 소스', price: 500 },
          ],
        }, {
          max_count: 1, name: '매운 정도',
          o: [
            { name: '매운맛', price: 0 },
            { name: '순한맛', price: 0 },
          ],
        }],
        image: 'image.url', mc_id: null,
        name: '뿌링클 치킨', price: 17000,
      }, {
        description: '치즈향 가득~', image: 'image.url',
        mc_id: null, name: '뿌링클 치킨', price: 17000,
      }, {
        description: '딸기 바나나 멜론맛!', image: 'image.url',
        mc_id: null, name: '신호등 치킨', price: 17000,
      },
    ],
    mc: [
      { name: 'special chicken' },
      { name: '바베큐 치킨' },
    ],
    o: [
      { g_id: null, name: '갈릭 소스', price: 500 },
      { g_id: null, name: '양념 소스', price: 500 },
      { g_id: null, name: '매운맛', price: 0 },
      { g_id: null, name: '순한맛', price: 0 },
    ],
  };
  const test_res: {
    g: ResGetGroupList[];
    m: ResGetMenuList[];
    mc: ResGetMenuCategoryList[];
    o: ResGetOptionList[];
  } = {
    g: [],
    m: [],
    mc: [],
    o: [],
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

    service = module.get<MenuService>(MenuService);
    r_service = module.get<RestaurantService>(RestaurantService);

    await r_service.create(test_r);
    r_token = (await r_service.sign_in({
      email: test_r.email,
      password: test_r.password,
    })).access_token;

    // upload MenuCategory

    await Promise.all(test_req.mc.map((e_mc) => service.upload_menu_category(r_token, e_mc)));
    test_res.mc = await service.get_menu_category_list(r_token);
    test_res.mc.forEach((e_mc, index) => {
      UtilService.verify(test_req.mc[index], e_mc, ['mc_id']);
    });

    // upload Menu

    test_req.m.forEach((e_m, index) => {
      test_req.m[index] = index < 2 ?
        { ...e_m, mc_id: test_res.mc[0].mc_id }
        : { ...e_m, mc_id: test_res.mc[1].mc_id };
    });
    await Promise.all(test_req.m.map((e_m) => service.upload_menu(e_m)));
    test_res.m = (await Promise.all([
      ...test_res.mc.map((e_mc) =>
        service.get_menu_list({ mc_id: e_mc.mc_id.toString() })),
    ])).flat();
    test_res.m.forEach((e_m, index) => {
      UtilService.verify(test_req.m[index], e_m, ['g_id', 'g', 'mc_id', 'm_id']);
    });

    // upload Group

    test_req.g.forEach((e_g, index) => {
      test_req.g[index] = index < 2 ?
        { ...e_g, m_id: test_res.m[2].m_id }
        : { ...e_g, m_id: test_res.m[3].m_id };
    });
    await Promise.all(test_req.g.map((e_g) => service.upload_group(e_g)));
    test_res.g = (await Promise.all([
      ...[2, 3].map((e) => service.get_group_list({ m_id: test_res.m[e].m_id.toString() })),
    ])).flat();
    test_res.g.forEach((e_g, index) => {
      UtilService.verify(test_req.g[index], e_g, ['g_id', 'o', 'm_id']);
    });

    // upload Option
    test_req.o.forEach((e_o, index) => {
      test_req.o[index] = index < 2 ?
        { ...e_o, g_id: test_res.g[2].g_id }
        : { ...e_o, g_id: test_res.g[3].g_id };
    });
    await Promise.all(test_req.o.map((e_o) => service.upload_option(e_o)));
    test_res.o = (await Promise.all([
      ...[2, 3].map((e) => service.get_option_list({ g_id: test_res.g[e].g_id.toString() })),
    ])).flat();
    test_res.o.forEach((e_o, index) => {
      UtilService.verify(test_req.o[index], e_o, ['g_id', 'o_id']);
    });
  });

  afterAll(async () => {
    // remove Option

    const o_ids: number[] = [];
    for (const e_o of test_res.o) {
      o_ids.push(e_o.o_id);
    }

    await service.remove_option(o_ids);

    const g_ids: number[] = [];
    for (const e_g of test_res.g) {
      g_ids.push(e_g.g_id);
    }

    const str_g_ids: string = g_ids.toString()
      .replace('[', '')
      .replace(']', '');

    const f_o_list: ResGetOptionList[] = await service.get_option_list({ g_id: str_g_ids });
    if (f_o_list.length > 0) {
      throw new Error();
    }
    // remove Group

    await service.remove_group(g_ids);

    const m_ids: number[] = [];
    for (const e_m of test_res.m) {
      m_ids.push(e_m.m_id);
    }

    const str_m_ids: string = m_ids.toString()
      .replace('[', '')
      .replace(']', '');

    const f_g_list: ResGetGroupList[] = await service.get_group_list({ m_id: str_m_ids });
    if (f_g_list.length > 2) {
      throw new Error();
    }

    // remove Menu

    await service.remove_menu(m_ids);

    const mc_ids: number[] = [];
    for (const e_mc of test_res.mc) {
      mc_ids.push(e_mc.mc_id);
    }

    const str_mc_ids: string = mc_ids.toString()
      .replace('[', '')
      .replace(']', '');

    const f_m_list: ResGetMenuList[] = await service.get_menu_list({ mc_id: str_mc_ids });
    if (f_m_list.length > 0) {
      throw new Error();

    }

    // remove MenuCategory

    await service.remove_menu_category(mc_ids);

    const f_mc_list: ResGetMenuCategoryList[] = await service.get_menu_category_list(r_token);
    if (f_mc_list.length > 0) {
      throw new Error();
    }

    // leave Restaurant

    await r_service.leave(r_token);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('Should success edit_menu_category()', async () => {
    const edit_data: DtoEditMenuCategory = { mc_id: test_res.mc[0].mc_id, name: '스페셜 치킨' };
    test_req.mc[0] = { ...test_req.mc[0], ...edit_data };
    await service.edit_menu_category(edit_data);
    test_res.mc[0] = await service.get_menu_category(test_res.mc[0].mc_id);

    UtilService.verify(test_req.mc[0], test_res.mc[0], ['mc_id']);
  });

  it('Should success edit_menu()', async () => {
    const edit_data: DtoEditMenu = {
      description: '물참나무 향 솔솔~ 담백한 엉치살 구이',
      m_id: test_res.m[0].m_id,
      name: '스모크 치킨', price: 18000,
    };
    test_req.m[0] = { ...test_req.m[0], ...edit_data };
    await service.edit_menu({ ...edit_data });
    test_res.m[0] = await service.get_menu(test_res.m[0].m_id);

    UtilService.verify(test_req.m[0], test_res.m[0], ['g_id', 'g', 'mc_id', 'm_id']);
  });

  it('Should success edit_group()', async () => {
    const edit_data: DtoEditGroup = { g_id: test_res.g[0].g_id, max_count: 0, name: '소스' };
    test_req.g[0] = { ...test_req.g[0], ...edit_data };
    await service.edit_group(edit_data);
    test_res.g[0] = await service.get_group(test_res.g[0].g_id);

    UtilService.verify(test_req.g[0], test_res.g[0], ['g_id', 'o', 'm_id']);
  });

  it('Should success edit_option()', async () => {
    const edit_data: DtoEditOption = { name: '어니언 소스', o_id: test_res.o[0].o_id, price: 400 };
    test_req.o[0] = { ...test_req.o[0], ...edit_data };
    await service.edit_option(edit_data);
    test_res.o[0] = await service.get_option(test_res.o[0].o_id);

    UtilService.verify(test_req.o[0], test_res.o[0], ['g_id', 'o_id']);
  });
});
