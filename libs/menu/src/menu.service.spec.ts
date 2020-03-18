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
import { MenuModule } from './menu.module';
import { MenuService } from './menu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@app/user';
import { UtilModule } from '@app/util';
import { classToPlain } from 'class-transformer';

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
    mc: DtoUploadMenuCategory;
    o: DtoUploadOption[];
  } = {
    g: [{
      m_id: null, max_count: 0, name: 'sauce',
      o: [{ name: '갈릭 소스', price: 500 }, { name: '양념 소스', price: 500 }],
    }, {
      m_id: null, max_count: 1, name: '매운 정도', o: [],
    }],
    m: [{
      description: '딸기 바나나 멜론맛!',
      g: [{
        max_count: 0, name: '소스',
        o: [{ name: '갈릭 소스', price: 500 }, { name: '양념 소스', price: 500 }],
      }, {
        max_count: 1, name: '매운 정도',
        o: [{ name: '매운맛', price: 0 }, { name: '순한맛', price: 0 }],
      }],
      image: 'image.url', mc_id: null,
      name: 'Traffic Light Chicken', price: 17000,
    }, {
      description: '치즈향 가득~', g: [], image: 'image.url',
      mc_id: null, name: '뿌링클 치킨', price: 17000,
    }],
    mc: { name: 'special chicken' },
    o: [{
      g_id: null, name: 'garlic sauce', price: 500,
    }, {
      g_id: null, name: '양념 소스', price: 500,
    }],
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

    await service.upload_menu_category(r_token, test_req.mc);
    test_res.mc = await service.get_menu_category_list(r_token);

    // upload Menu

    test_req.m = test_req.m.map((e_m) => ({
      ...e_m, mc_id: test_res.mc[0].mc_id,
    }));
    for (const e_m of test_req.m) {
      await service.upload_menu(e_m);
    }
    test_res.m = await service.get_menu_list({
      mc_id: test_res.mc[0].mc_id.toString(),
    });

    // upload Group

    test_req.g = test_req.g.map((e_g) => ({
      ...e_g, m_id: test_res.m[1].m_id,
    }));
    for (const e_g of test_req.g) {
      await service.upload_group(e_g);
    }
    test_res.g = await service.get_group_list({
      m_id: test_res.m[1].m_id.toString(),
    });

    // upload Option

    test_req.o = test_req.o.map((e_o) => ({
      ...e_o, g_id: test_res.g[1].g_id,
    }));
    for (const e_o of test_req.o) {
      await service.upload_option(e_o);
    }
    test_res.o = await service.get_option_list({
      g_id: test_res.g[1].g_id.toString(),
    });
  });

  afterAll(async () => {
    // remove Option

    const o_ids: number[] = [];
    for (const e_o of test_res.o) {
      o_ids.push(e_o.o_id);
    }
    await service.remove_option(o_ids);

    await expect(service.get_option_list({
      g_id: test_res.g[1].g_id.toString(),
    })).rejects.toThrow();

    // remove Group

    const g_ids: number[] = [];
    for (const e_g of test_res.g) {
      g_ids.push(e_g.g_id);
    }
    await service.remove_group(g_ids);

    await expect(service.get_group_list({
      m_id: test_res.m[1].m_id.toString(),
    })).rejects.toThrow();

    // remove Menu

    const m_ids: number[] = [];
    for (const e_m of test_res.m) {
      m_ids.push(e_m.m_id);
    }
    await service.remove_menu(m_ids);

    await expect(service.get_option_list({
      g_id: test_res.mc[0].mc_id.toString(),
    })).rejects.toThrow();

    // remove MenuCategory

    await service.remove_menu_category([test_res.mc[0].mc_id]);
    await expect(service.get_menu_category_list(r_token)).rejects.toThrow();

    await r_service.leave(r_token);
  });

  it('should success edit_menu_category()', async () => {
    const edit_data: DtoEditMenuCategory = {
      mc_id: test_res.mc[0].mc_id, name: '스폐셜 치킨',
    };
    await service.edit_menu_category(edit_data);

    test_res.mc[0] = await service.get_menu_category(edit_data.mc_id);
    expect(classToPlain(test_res.mc[0])).toStrictEqual(edit_data);
  });

  it('should success edit_menu()', async () => {
    const edit_data: DtoEditMenu = {
      description: '3색 치킨!', image: 'url.image',
      m_id: test_res.m[0].m_id,
      name: '신호등 치킨', price: 20000,
    };
    await service.edit_menu(edit_data);

    test_res.m[0] = await service.get_menu(edit_data.m_id);
    expect(classToPlain(test_res.m[0])).toStrictEqual(edit_data);
  });

  it('should success edit_group()', async () => {
    const edit_data: DtoEditGroup = {
      g_id: test_res.g[0].g_id,
      max_count: 0, name: '소스',
    };
    await service.edit_group(edit_data);

    test_res.g[0] = await service.get_group(edit_data.g_id);
    expect(classToPlain(test_res.g[0])).toStrictEqual(edit_data);
  });

  it('should success edit_option()', async () => {
    const edit_data: DtoEditOption = {
      name: '마늘 소스', o_id: test_res.o[0].o_id, price: 1000,
    };
    await service.edit_option(edit_data);

    test_res.o[0] = await service.get_option(edit_data.o_id);
    expect(classToPlain(test_res.o[0])).toStrictEqual(edit_data);
  });
});
