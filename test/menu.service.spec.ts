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
  let menuService: MenuService;
  let restaurantService: RestaurantService;
  let restaurantTokens: string[];
  const testGroup: DtoUploadGroup = {
    maxCount: 0, menuId: null, name: 'sauce',
    option: [{ name: 'garlic sauce', price: 500 }],
  };
  const testMenu: DtoUploadMenu = {
    description: 'strawberry, banana, melon!',
    group: [{
      maxCount: 0, name: '소스',
      option: [{ name: '갈릭 소스', price: 500 }],
    }],
    image: 'image.url', menuCategoryId: null,
    name: 'Traffic Light Chicken', price: 17000,
  };
  const testMenuCategory: DtoUploadMenuCategory = { name: 'special chicken' };
  const testOption: DtoUploadOption = {
    groupId: null, name: 'garlic sauce', price: 500,
  };
  const testRestaurant: DtoCreateRestaurant = {
    address: 'a',
    area: 'c',
    category: 'menu_test',
    closeTime: 'element',
    dayOff: 'f',
    description: 'g',
    email: 'menu_test@gmail.com',
    image: 'image.url',
    minPrice: 10000,
    name: 'menu_test',
    offlinePayment: false,
    onlinePayment: false,
    openTime: 'i',
    password: 'menu_test',
    phone: '01012345678',
    roadAddress: 'b',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MenuModule, RestaurantModule, TestUtilModule, AuthModule,
        TypeOrmModule.forRoot(config.mysqlConfig),
        TypeOrmModule.forRoot(config.mongodbConfig),
        TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
        TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
        UtilModule,
      ],
      providers: [MenuService],
    }).compile();

    menuService = module.get<MenuService>(MenuService);
    restaurantService = module.get<RestaurantService>(RestaurantService);

    const testRestaurants: DtoCreateRestaurant[] = [];

    for (let i: number = 0; i < 8; i++) {
      testRestaurants.push({
        ...testRestaurant,
        email: i.toString() + testRestaurant.email,
        name: testRestaurant.name + i.toString(),
      });
    }

    restaurantTokens = (await Promise.all(testRestaurants
      .map(async (elementRestaurant: DtoCreateRestaurant): Promise<ResSignIn> => {
        await restaurantService.create(elementRestaurant);
        return restaurantService.signIn({
          email: elementRestaurant.email,
          password: elementRestaurant.password,
        });
      }))).map((elementToken: ResSignIn): string => elementToken.accessToken);
  });

  afterAll(async () => {
    await Promise.all(restaurantTokens
      .map(async (elementToken: string): Promise<void> => restaurantService.leave(elementToken)));

    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('should success uploadMenuCategory()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory =
      await menuService.uploadMenuCategory(restaurantTokens[0], testMenuCategory);

    const [foundMenuCategory]: ResGetMenuCategoryList[] = await menuService
      .getMenuCategoryList(restaurantTokens[0]);

    const [requestMenuCategory, responseMenuCategory] = TestUtilService
      .makeElementComparable(testMenuCategory, foundMenuCategory, ['menuCategoryId']);
    expect(requestMenuCategory).toStrictEqual(responseMenuCategory);

    await menuService.removeMenuCategory([menuCategoryId]);
  });

  it('should success editMenuCategory()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory =
      await menuService.uploadMenuCategory(restaurantTokens[1], testMenuCategory);

    const editData: DtoEditMenuCategory = { menuCategoryId, name: 'etc' };

    await menuService.editMenuCategory(editData);

    const [foundMenuCategory]: ResGetMenuCategoryList[] = await menuService
      .getMenuCategoryList(restaurantTokens[1]);

    const [requestMenuCategory, responseMenuCategory] = TestUtilService
      .makeElementComparable(editData, foundMenuCategory, ['menuCategoryId']);
    expect(requestMenuCategory).toStrictEqual(responseMenuCategory);

    await menuService.removeMenuCategory([menuCategoryId]);
  });

  it('should success uploadMenu()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory = await menuService
      .uploadMenuCategory(restaurantTokens[2], testMenuCategory);

    const { menuId }: ResUploadMenu = await menuService.uploadMenu({ ...testMenu, menuCategoryId });

    const [foundMenu]: ResGetMenuList[] = await menuService.getMenuList({
      menuCategoryId: menuCategoryId.toString(),
    });

    const [requestMenu, responseMenu] = TestUtilService
      .makeElementComparable(testMenu, foundMenu, ['menuId', 'menuCategoryId', 'group']);
    const [requestGroup, responseGroup] = TestUtilService
      .makeElementComparable(testMenu.group[0], foundMenu.group[0], ['groupId', 'option']);
    const [requestOption, responseOption] = TestUtilService
      .makeElementComparable(testMenu.group[0].option[0], foundMenu.group[0].option[0], ['optionId']);

    expect(requestMenu).toStrictEqual(responseMenu);
    expect(requestGroup).toStrictEqual(responseGroup);
    expect(requestOption).toStrictEqual(responseOption);

    await menuService.removeMenu([menuId]);
  });

  it('should success editMenu()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory =
      await menuService.uploadMenuCategory(restaurantTokens[3], testMenuCategory);
    const { menuId }: ResUploadMenu =
      await menuService.uploadMenu({ ...testMenu, menuCategoryId });

    const editData: DtoEditMenu = {
      description: 'normal',
      image: 'url.image', menuId,
      name: 'fried chicken',
      price: 17000,
    };

    await menuService.editMenu({ ...editData, menuId });

    const [foundMenu]: ResGetMenuList[] = await menuService.getMenuList({
      menuCategoryId: menuCategoryId.toString(),
    });

    const [requestMenu, responseMenu] = TestUtilService
      .makeElementComparable(editData, foundMenu, ['menuId', 'menuCategoryId', 'group']);
    expect(requestMenu).toStrictEqual(responseMenu);

    await menuService.removeMenu([menuId]);
  });

  it('should success uploadGroup()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory =
      await menuService.uploadMenuCategory(restaurantTokens[4], testMenuCategory);
    const menu: DtoUploadMenu = { ...testMenu };

    Reflect.deleteProperty(menu, 'group');

    const { menuId }: ResUploadMenu = await menuService.uploadMenu({ ...menu, menuCategoryId });
    const { groupId }: ResUploadGroup = await menuService.uploadGroup({ ...testGroup, menuId });

    const [foundGroup]: ResGetGroupList[] = await menuService.getGroupList({ menuId: menuId.toString() });

    const [requestGroup, responseGroup] = TestUtilService
      .makeElementComparable(testGroup, foundGroup, ['groupId', 'menuId', 'option']);
    const [requestOption, responseOption] = TestUtilService
      .makeElementComparable(testGroup.option[0], foundGroup.option[0], ['optionId']);

    expect(requestGroup).toStrictEqual(responseGroup);
    expect(requestOption).toStrictEqual(responseOption);

    await menuService.removeGroup([groupId]);
  });

  it('should success editGroup()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory =
      await menuService.uploadMenuCategory(restaurantTokens[5], testMenuCategory);
    const menu: DtoUploadMenu = { ...testMenu };
    Reflect.deleteProperty(menu, 'group');
    const { menuId }: ResUploadMenu = await menuService.uploadMenu({ ...menu, menuCategoryId });
    const { groupId }: ResUploadGroup = await menuService.uploadGroup({ ...testGroup, menuId });

    const editData: DtoEditGroup = {
      groupId, maxCount: 0, name: 'etc',
    };

    await menuService.editGroup({ ...editData, groupId });

    const [foundGroup]: ResGetGroupList[] = await menuService.getGroupList({ menuId: menuId.toString() });

    const [requestGroup, responseGroup] = TestUtilService
      .makeElementComparable(editData, foundGroup, ['groupId', 'option']);
    expect(requestGroup).toStrictEqual(responseGroup);

    await menuService.removeGroup([groupId]);
  });

  it('should success uploadOption()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory =
      await menuService.uploadMenuCategory(restaurantTokens[6], testMenuCategory);

    const menu: DtoUploadMenu = { ...testMenu };
    Reflect.deleteProperty(menu.group[0], 'option');

    await menuService.uploadMenu({ ...menu, menuCategoryId });

    const [{ group: [{ groupId }] }]: ResGetMenuList[] =
      await menuService.getMenuList({ menuCategoryId: menuCategoryId.toString() });
    const { optionId }: ResUploadOption = await menuService.uploadOption({ ...testOption, groupId });

    const [foundOption]: ResGetOptionList[] = await menuService
      .getOptionList({ groupId: groupId.toString() });

    const [requestOption, responseOption] = TestUtilService
      .makeElementComparable(testOption, foundOption, ['groupId', 'optionId']);

    expect(requestOption).toStrictEqual(responseOption);

    await menuService.removeOption([optionId]);
  });

  it('should success editOption()', async () => {
    const { menuCategoryId }: ResUploadMenuCategory =
      await menuService.uploadMenuCategory(restaurantTokens[7], testMenuCategory);

    const menu: DtoUploadMenu = { ...testMenu };
    Reflect.deleteProperty(menu.group[0], 'option');

    await menuService.uploadMenu({ ...menu, menuCategoryId });

    const [{ group: [{ groupId }] }]: ResGetMenuList[] =
      await menuService.getMenuList({ menuCategoryId: menuCategoryId.toString() });
    const { optionId }: ResUploadOption = await menuService.uploadOption({ ...testOption, groupId });

    const editData: DtoEditOption = { name: 'onion', optionId, price: 600 };

    await menuService.editOption({ ...editData, optionId });

    const [foundOption]: ResGetOptionList[] = await menuService
      .getOptionList({ groupId: groupId.toString() });

    const [requestOption, responseOption] = TestUtilService
      .makeElementComparable(editData, foundOption, ['optionId']);
    expect(requestOption).toStrictEqual(responseOption);

    await menuService.removeOption([optionId]);
  });
});
