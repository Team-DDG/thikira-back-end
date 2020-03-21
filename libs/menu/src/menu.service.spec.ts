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
    group: DtoUploadGroup[];
    menu: DtoUploadMenu[];
    menu_category: DtoUploadMenuCategory;
    option: DtoUploadOption[];
  } = {
    group: [{
      m_id: null, max_count: 0, name: 'sauce',
      option: [{ name: '갈릭 소스', price: 500 }, { name: '양념 소스', price: 500 }],
    }, {
      m_id: null, max_count: 1, name: '매운 정도', option: [],
    }],
    menu: [{
      description: '딸기 바나나 멜론맛!',
      group: [{
        max_count: 0, name: '소스',
        option: [{ name: '갈릭 소스', price: 500 }, { name: '양념 소스', price: 500 }],
      }, {
        max_count: 1, name: '매운 정도',
        option: [{ name: '매운맛', price: 0 }, { name: '순한맛', price: 0 }],
      }],
      image: 'image.url', mc_id: null,
      name: 'Traffic Light Chicken', price: 17000,
    }, {
      description: '치즈향 가득~', group: [], image: 'image.url',
      mc_id: null, name: '뿌링클 치킨', price: 17000,
    }],
    menu_category: { name: 'special chicken' },
    option: [{
      g_id: null, name: 'garlic sauce', price: 500,
    }, {
      g_id: null, name: '양념 소스', price: 500,
    }],
  };
  const test_res: {
    group: ResGetGroupList[];
    menu: ResGetMenuList[];
    menu_category: ResGetMenuCategoryList[];
    option: ResGetOptionList[];
  } = {
    group: [],
    menu: [],
    menu_category: [],
    option: [],
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

    await service.upload_menu_category(r_token, test_req.menu_category);
    test_res.menu_category = await service.get_menu_category_list(r_token);

    // upload Menu

    test_req.menu = test_req.menu.map((e_m: DtoUploadMenu) => ({
      ...e_m, mc_id: test_res.menu_category[0].mc_id,
    }));
    for (const e_m of test_req.menu) {
      await service.upload_menu(e_m);
    }
    test_res.menu = await service.get_menu_list({
      mc_id: test_res.menu_category[0].mc_id.toString(),
    });

    // upload Group

    test_req.group = test_req.group.map((e_g: DtoUploadGroup) => ({
      ...e_g, m_id: test_res.menu[1].m_id,
    }));
    for (const e_g of test_req.group) {
      await service.upload_group(e_g);
    }
    test_res.group = await service.get_group_list({
      m_id: test_res.menu[1].m_id.toString(),
    });

    // upload Option

    test_req.option = test_req.option.map((e_o: DtoUploadOption) => ({
      ...e_o, g_id: test_res.group[1].g_id,
    }));
    for (const e_o of test_req.option) {
      await service.upload_option(e_o);
    }
    test_res.option = await service.get_option_list({
      g_id: test_res.group[1].g_id.toString(),
    });
  });

  afterAll(async () => {
    // remove Option

    const o_ids: number[] = [];
    for (const e_o of test_res.option) {
      o_ids.push(e_o.o_id);
    }
    await service.remove_option(o_ids);

    await expect(service.get_option_list({
      g_id: test_res.group[1].g_id.toString(),
    })).rejects.toThrow();

    // remove Group

    const g_ids: number[] = [];
    for (const e_g of test_res.group) {
      g_ids.push(e_g.g_id);
    }
    await service.remove_group(g_ids);

    await expect(service.get_group_list({
      m_id: test_res.menu[1].m_id.toString(),
    })).rejects.toThrow();

    // remove Menu

    const m_ids: number[] = [];
    for (const e_m of test_res.menu) {
      m_ids.push(e_m.m_id);
    }
    await service.remove_menu(m_ids);

    await expect(service.get_option_list({
      g_id: test_res.menu_category[0].mc_id.toString(),
    })).rejects.toThrow();

    // remove MenuCategory

    await service.remove_menu_category([test_res.menu_category[0].mc_id]);
    await expect(service.get_menu_category_list(r_token)).rejects.toThrow();

    await r_service.leave(r_token);

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('should success edit_menu_category()', async () => {
    const edit_data: DtoEditMenuCategory = {
      mc_id: test_res.menu_category[0].mc_id, name: '스폐셜 치킨',
    };
    await service.edit_menu_category(edit_data);

    test_res.menu_category[0] = await service.get_menu_category(edit_data.mc_id);
    expect(classToPlain(test_res.menu_category[0])).toStrictEqual(edit_data);
  });

  it('should success edit_menu()', async () => {
    const edit_data: DtoEditMenu = {
      description: '3색 치킨!', image: 'url.image',
      m_id: test_res.menu[0].m_id,
      name: '신호등 치킨', price: 20000,
    };
    await service.edit_menu(edit_data);

    test_res.menu[0] = await service.get_menu(edit_data.m_id);
    expect(classToPlain(test_res.menu[0])).toStrictEqual(edit_data);
  });

  it('should success edit_group()', async () => {
    const edit_data: DtoEditGroup = {
      g_id: test_res.group[0].g_id,
      max_count: 0, name: '소스',
    };
    await service.edit_group(edit_data);

    test_res.group[0] = await service.get_group(edit_data.g_id);
    expect(classToPlain(test_res.group[0])).toStrictEqual(edit_data);
  });

  it('should success edit_option()', async () => {
    const edit_data: DtoEditOption = {
      name: '마늘 소스', o_id: test_res.option[0].o_id, price: 1000,
    };
    await service.edit_option(edit_data);

    test_res.option[0] = await service.get_option(edit_data.o_id);
    expect(classToPlain(test_res.option[0])).toStrictEqual(edit_data);
  });
});
