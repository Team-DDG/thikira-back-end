import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { MenuModule, MenuService } from '@app/menu';
import { RestaurantModule, RestaurantService } from '@app/restaurant';
import { TestUtilModule, TestUtilService } from '@app/test-util';
import {
  DtoCreateRestaurant,
  DtoEditGroup,
  DtoEditMenu,
  DtoEditMenuCategory,
  DtoEditOption,
  DtoUploadGroup,
  DtoUploadMenu,
  DtoUploadMenuCategory,
  DtoUploadOption,
  ResGetGroupList,
  ResGetMenuCategoryList,
  ResGetMenuList,
  ResGetOptionList,
  ResSignIn,
  ResUploadGroup,
  ResUploadMenu,
  ResUploadMenuCategory,
  ResUploadOption,
} from '@app/type';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

describe('MenuService', () => {
  let menu_service: MenuService;
  let restaurant_service: RestaurantService;
  let restaurant_tokens: string[];
  const test_group: DtoUploadGroup = {
    m_id: null, max_count: 0, name: 'sauce',
    option: [{ name: 'garlic sauce', price: 500 }],
  };
  const test_menu: DtoUploadMenu = {
    description: 'strawberry, banana, melon!',
    group: [{
      max_count: 0, name: '소스',
      option: [{ name: '갈릭 소스', price: 500 }],
    }],
    image: 'image.url', mc_id: null,
    name: 'Traffic Light Chicken', price: 17000,
  };
  const test_menuCategory: DtoUploadMenuCategory = { name: 'special chicken' };
  const test_option: DtoUploadOption = {
    g_id: null, name: 'garlic sauce', price: 500,
  };
  const test_restaurant: DtoCreateRestaurant = {
    address: 'a',
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
    road_address: 'b',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MenuModule, RestaurantModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysql_config),
        TypeOrmModule.forRoot(config.mongodb_config),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UtilModule,
      ],
      providers: [MenuService],
    }).compile();

    menu_service = module.get<MenuService>(MenuService);
    restaurant_service = module.get<RestaurantService>(RestaurantService);

    const test_restaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 8; i++) {
      test_restaurants.push({
        ...test_restaurant,
        email: i.toString() + test_restaurant.email,
        name: test_restaurant.name + i.toString(),
      });
    }

    restaurant_tokens = (await Promise.all(test_restaurants
      .map(async (e_restaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurant_service.create(e_restaurant);
        return restaurant_service.signIn({
          email: e_restaurant.email,
          password: e_restaurant.password,
        });
      }))).map((e_token: ResSignIn): string => e_token.access_token);
  });

  afterAll(async () => {
    await Promise.all(restaurant_tokens
      .map(async (e_token: string): Promise<void> => restaurant_service.leave(e_token)));

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('should success uploadMenuCategory()', async () => {
    const { mc_id }: ResUploadMenuCategory =
      await menu_service.uploadMenuCategory(restaurant_tokens[0], test_menuCategory);

    const [found_menu_category]: ResGetMenuCategoryList[] = await menu_service
      .getMenuCategoryList(restaurant_tokens[0]);

    const [req_menu_category, res_menu_category] = TestUtilService
      .makeElementComparable(test_menuCategory, found_menu_category, ['mc_id']);
    expect(req_menu_category).toStrictEqual(res_menu_category);

    await menu_service.removeMenuCategory([mc_id]);
  });

  it('should success editMenuCategory()', async () => {
    const { mc_id }: ResUploadMenuCategory =
      await menu_service.uploadMenuCategory(restaurant_tokens[1], test_menuCategory);

    const edit_data: DtoEditMenuCategory = { mc_id, name: 'etc' };

    await menu_service.editMenuCategory(edit_data);

    const [found_menu_category]: ResGetMenuCategoryList[] = await menu_service
      .getMenuCategoryList(restaurant_tokens[1]);

    const [req_menu_category, res_menu_category] = TestUtilService
      .makeElementComparable(edit_data, found_menu_category, ['mc_id']);
    expect(req_menu_category).toStrictEqual(res_menu_category);

    await menu_service.removeMenuCategory([mc_id]);
  });

  it('should success uploadMenu()', async () => {
    const { mc_id }: ResUploadMenuCategory = await menu_service
      .uploadMenuCategory(restaurant_tokens[2], test_menuCategory);

    const { m_id }: ResUploadMenu = await menu_service.uploadMenu({ ...test_menu, mc_id });

    const [found_menu]: ResGetMenuList[] = await menu_service.getMenuList({
      mc_id: mc_id.toString(),
    });

    const [req_menu, res_menu] = TestUtilService
      .makeElementComparable(test_menu, found_menu, ['m_id', 'mc_id', 'group']);
    const [req_group, res_group] = TestUtilService
      .makeElementComparable(test_menu.group[0], found_menu.group[0], ['g_id', 'option']);
    const [req_option, res_option] = TestUtilService
      .makeElementComparable(test_menu.group[0].option[0], found_menu.group[0].option[0], ['o_id']);

    expect(req_menu).toStrictEqual(res_menu);
    expect(req_group).toStrictEqual(res_group);
    expect(req_option).toStrictEqual(res_option);

    await menu_service.removeMenu([m_id]);
  });

  it('should success editMenu()', async () => {
    const { mc_id }: ResUploadMenuCategory =
      await menu_service.uploadMenuCategory(restaurant_tokens[3], test_menuCategory);
    const { m_id }: ResUploadMenu =
      await menu_service.uploadMenu({ ...test_menu, mc_id });

    const edit_data: DtoEditMenu = {
      description: 'normal',
      image: 'url.image', m_id,
      name: 'fried chicken',
      price: 17000,
    };

    await menu_service.editMenu({ ...edit_data, m_id });

    const [found_menu]: ResGetMenuList[] = await menu_service.getMenuList({
      mc_id: mc_id.toString(),
    });

    const [req_menu, res_menu] = TestUtilService
      .makeElementComparable(edit_data, found_menu, ['m_id', 'mc_id', 'group']);
    expect(req_menu).toStrictEqual(res_menu);

    await menu_service.removeMenu([m_id]);
  });

  it('should success uploadGroup()', async () => {
    const { mc_id }: ResUploadMenuCategory =
      await menu_service.uploadMenuCategory(restaurant_tokens[4], test_menuCategory);
    const menu: DtoUploadMenu = { ...test_menu };

    Reflect.deleteProperty(menu, 'group');

    const { m_id }: ResUploadMenu = await menu_service.uploadMenu({ ...menu, mc_id });
    const { g_id }: ResUploadGroup = await menu_service.uploadGroup({ ...test_group, m_id });

    const [found_group]: ResGetGroupList[] = await menu_service.getGroupList({ m_id: m_id.toString() });

    const [req_group, res_group] = TestUtilService
      .makeElementComparable(test_group, found_group, ['g_id', 'm_id', 'option']);
    const [req_option, res_option] = TestUtilService
      .makeElementComparable(test_group.option[0], found_group.option[0], ['o_id']);

    expect(req_group).toStrictEqual(res_group);
    expect(req_option).toStrictEqual(res_option);

    await menu_service.removeGroup([g_id]);
  });

  it('should success editGroup()', async () => {
    const { mc_id }: ResUploadMenuCategory =
      await menu_service.uploadMenuCategory(restaurant_tokens[5], test_menuCategory);
    const menu: DtoUploadMenu = { ...test_menu };
    Reflect.deleteProperty(menu, 'group');
    const { m_id }: ResUploadMenu = await menu_service.uploadMenu({ ...menu, mc_id });
    const { g_id }: ResUploadGroup = await menu_service.uploadGroup({ ...test_group, m_id });

    const edit_data: DtoEditGroup = {
      g_id, max_count: 0, name: 'etc',
    };

    await menu_service.editGroup({ ...edit_data, g_id });

    const [found_group]: ResGetGroupList[] = await menu_service.getGroupList({ m_id: m_id.toString() });

    const [req_group, res_group] = TestUtilService
      .makeElementComparable(edit_data, found_group, ['g_id', 'option']);
    expect(req_group).toStrictEqual(res_group);

    await menu_service.removeGroup([g_id]);
  });

  it('should success uploadOption()', async () => {
    const { mc_id }: ResUploadMenuCategory =
      await menu_service.uploadMenuCategory(restaurant_tokens[6], test_menuCategory);

    const menu: DtoUploadMenu = { ...test_menu };
    Reflect.deleteProperty(menu.group[0], 'option');

    await menu_service.uploadMenu({ ...menu, mc_id });

    const [{ group: [{ g_id }] }]: ResGetMenuList[] =
      await menu_service.getMenuList({ mc_id: mc_id.toString() });
    const { o_id }: ResUploadOption = await menu_service.uploadOption({ ...test_option, g_id });

    const [found_option]: ResGetOptionList[] = await menu_service.getOptionList({ g_id: g_id.toString() });

    const [req_option, res_option] = TestUtilService
      .makeElementComparable(test_option, found_option, ['g_id', 'o_id']);

    expect(req_option).toStrictEqual(res_option);

    await menu_service.removeOption([o_id]);
  });

  it('should success editOption()', async () => {
    const { mc_id }: ResUploadMenuCategory =
      await menu_service.uploadMenuCategory(restaurant_tokens[7], test_menuCategory);

    const menu: DtoUploadMenu = { ...test_menu };
    Reflect.deleteProperty(menu.group[0], 'option');

    await menu_service.uploadMenu({ ...menu, mc_id });

    const [{ group: [{ g_id }] }]: ResGetMenuList[] =
      await menu_service.getMenuList({ mc_id: mc_id.toString() });
    const { o_id }: ResUploadOption = await menu_service.uploadOption({ ...test_option, g_id });

    const edit_data: DtoEditOption = { name: 'onion', o_id, price: 600 };

    await menu_service.editOption({ ...edit_data, o_id });

    const [found_option]: ResGetOptionList[] = await menu_service
      .getOptionList({ g_id: g_id.toString() });

    const [req_option, res_option] = TestUtilService
      .makeElementComparable(edit_data, found_option, ['o_id']);
    expect(req_option).toStrictEqual(res_option);

    await menu_service.removeOption([o_id]);
  });
});
