import {
  DtoCreateRestaurant,
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption,
  DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
} from '@app/type/req';
import {
  ResGetGroupList, ResGetMenuCategoryList,
  ResGetMenuList, ResGetOptionList, ResSignIn,
  ResUploadGroup, ResUploadMenu,
  ResUploadMenuCategory, ResUploadOption,
} from '@app/type/res';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { Test, TestingModule } from '@nestjs/testing';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import { mongodb_entities, mysql_entities } from '@app/entity';
import { MenuModule } from './menu.module';
import { MenuService } from './menu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@app/util';
import { config } from '@app/config';
import { getConnection } from 'typeorm';

describe('MenuService', () => {
  let r_service: RestaurantService;
  let service: MenuService;
  const test_g: DtoUploadGroup = {
    m_id: null, max_count: 0, name: 'sauce',
    option: [{ name: 'garlic sauce', price: 500 }],
  };
  const test_m: DtoUploadMenu = {
    description: 'strawberry, banana, melon!',
    group: [{
      max_count: 0, name: '소스',
      option: [{ name: '갈릭 소스', price: 500 }],
    }],
    image: 'image.url', mc_id: null,
    name: 'Traffic Light Chicken', price: 17000,
  };
  const test_mc: DtoUploadMenuCategory = { name: 'special chicken' };
  const test_o: DtoUploadOption = {
    g_id: null, name: 'garlic sauce', price: 500,
  };
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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MenuModule, RestaurantModule, TestUtilModule,
        TypeOrmModule.forRoot({
          ...config.mysql_config,
          entities: mysql_entities,
          name: 'mysql',
        }),
        TypeOrmModule.forRoot({
          ...config.mongodb_config,
          entities: mongodb_entities,
          name: 'mongodb',
        }),
        TypeOrmModule.forFeature(mysql_entities, 'mysql'),
        TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
        UtilModule,
      ],
      providers: [MenuService],
    }).compile();

    service = module.get<MenuService>(MenuService);
    r_service = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('should success upload_menu_category()', async () => {
    await r_service.create(test_r);
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: test_r.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);

    const f_menu_category: ResGetMenuCategoryList = (await service.get_menu_category_list(access_token))[0];
    const [req_mc, res_mc] = TestUtilService.make_comparable(test_mc, f_menu_category, ['mc_id']);

    expect(req_mc).toStrictEqual(res_mc);

    await service.remove_menu_category([mc_id]);

    await r_service.leave(access_token);
  });

  it('should success edit_menu_category()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `2${test_r.email}`, name: `${test_r.name}_2`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);
    const edit_data: DtoEditMenuCategory = { mc_id, name: 'etc' };

    await service.edit_menu_category(edit_data);

    const f_menu_category: ResGetMenuCategoryList = (await service.get_menu_category_list(access_token))[0];
    const [req_mc, res_mc] = TestUtilService.make_comparable(edit_data, f_menu_category, ['mc_id']);

    expect(req_mc).toStrictEqual(res_mc);

    await service.remove_menu_category([mc_id]);

    await r_service.leave(access_token);
  });

  it('should success upload_menu()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `3${test_r.email}`, name: `${test_r.name}_3`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);
    const { m_id }: ResUploadMenu = await service.upload_menu({ ...test_m, mc_id });

    const f_menu: ResGetMenuList = (await service.get_menu_list({ mc_id: mc_id.toString() }))[0];

    const [req_m, res_m] = TestUtilService.make_comparable(test_m, f_menu, ['m_id', 'mc_id', 'group']);
    const [req_g, res_g] = TestUtilService
      .make_comparable(test_m.group[0], f_menu.group[0], ['g_id', 'option']);
    const [req_o, res_o] = TestUtilService
      .make_comparable(test_m.group[0].option[0], f_menu.group[0].option[0], ['o_id']);

    expect(req_m).toStrictEqual(res_m);
    expect(req_g).toStrictEqual(res_g);
    expect(req_o).toStrictEqual(res_o);

    await service.remove_menu([m_id]);

    await r_service.leave(access_token);
  });

  it('should success edit_menu()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `4${test_r.email}`, name: `${test_r.name}_4`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);
    const { m_id }: ResUploadMenu = await service.upload_menu({ ...test_m, mc_id });

    const edit_data: DtoEditMenu = {
      description: 'normal',
      image: 'url.image', m_id,
      name: 'fried chicken',
      price: 17000,
    };

    await service.edit_menu({ ...edit_data, m_id });

    const f_menu: ResGetMenuList = (await service.get_menu_list({ mc_id: mc_id.toString() }))[0];

    const [req_m, res_m] = TestUtilService.make_comparable(edit_data, f_menu, ['m_id', 'mc_id', 'group']);
    expect(req_m).toStrictEqual(res_m);

    await service.remove_menu([m_id]);

    await r_service.leave(access_token);
  });

  it('should success upload_group()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `5${test_r.email}`, name: `${test_r.name}_5`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);
    const menu: DtoUploadMenu = { ...test_m };
    Reflect.deleteProperty(menu, 'group');
    const { m_id }: ResUploadMenu = await service.upload_menu({ ...menu, mc_id });
    const { g_id }: ResUploadGroup = await service.upload_group({ ...test_g, m_id });

    const f_group: ResGetGroupList = (await service.get_group_list({ m_id: m_id.toString() }))[0];

    const [req_g, res_g] = TestUtilService.make_comparable(test_g, f_group, ['g_id', 'm_id', 'option']);
    const [req_o, res_o] = TestUtilService.make_comparable(test_g.option[0], f_group.option[0], ['o_id']);

    expect(req_g).toStrictEqual(res_g);
    expect(req_o).toStrictEqual(res_o);

    await service.remove_group([g_id]);

    await r_service.leave(access_token);
  });

  it('should success edit_group()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `6${test_r.email}`, name: `${test_r.name}_6`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);
    const menu: DtoUploadMenu = { ...test_m };
    Reflect.deleteProperty(menu, 'group');
    const { m_id }: ResUploadMenu = await service.upload_menu({ ...menu, mc_id });
    const { g_id }: ResUploadGroup = await service.upload_group({ ...test_g, m_id });

    const edit_data: DtoEditGroup = {
      g_id, max_count: 0,
      name: 'etc',
    };

    await service.edit_group({ ...edit_data, g_id });

    const f_group: ResGetGroupList = (await service.get_group_list({ m_id: m_id.toString() }))[0];

    const [req_g, res_g] = TestUtilService.make_comparable(edit_data, f_group, ['g_id', 'option']);
    expect(req_g).toStrictEqual(res_g);

    await service.remove_group([g_id]);

    await r_service.leave(access_token);
  });

  it('should success upload_option()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `7${test_r.email}`, name: `${test_r.name}_7`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);
    const menu: DtoUploadMenu = { ...test_m };
    Reflect.deleteProperty(menu.group[0], 'option');
    await service.upload_menu({ ...menu, mc_id });

    const { g_id }: ResGetGroupList = (await service.get_menu_list({ mc_id: mc_id.toString() }))[0].group[0];
    const { o_id }: ResUploadOption = await service.upload_option({ ...test_o, g_id });

    const f_option: ResGetOptionList = (await service.get_option_list({ g_id: g_id.toString() }))[0];

    const [req_o, res_o] = TestUtilService.make_comparable(test_o, f_option, ['g_id', 'o_id']);

    expect(req_o).toStrictEqual(res_o);

    await service.remove_option([o_id]);

    await r_service.leave(access_token);
  });

  it('should success edit_option()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `7${test_r.email}`, name: `${test_r.name}_7`,
    };
    await r_service.create({ ...test_r, ...restaurant });
    const { access_token }: ResSignIn = await r_service.sign_in({
      email: restaurant.email, password: test_r.password,
    });

    const { mc_id }: ResUploadMenuCategory = await service.upload_menu_category(access_token, test_mc);
    const menu: DtoUploadMenu = { ...test_m };
    Reflect.deleteProperty(menu.group[0], 'option');
    await service.upload_menu({ ...menu, mc_id });
    const { g_id }: ResGetGroupList = (await service.get_menu_list({ mc_id: mc_id.toString() }))[0].group[0];
    const { o_id }: ResUploadOption = await service.upload_option({ ...test_o, g_id });

    const edit_data: DtoEditOption = { name: 'onion', o_id, price: 600 };

    await service.edit_option({ ...edit_data, o_id });

    const f_option: ResGetOptionList = (await service.get_option_list({ g_id: g_id.toString() }))[0];

    const [req_o, res_o] = TestUtilService.make_comparable(edit_data, f_option, ['o_id']);
    expect(req_o).toStrictEqual(res_o);

    await service.remove_option([o_id]);

    await r_service.leave(access_token);
  });
});
