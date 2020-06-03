import { AuthModule } from '@app/auth';
import { config } from '@app/config';
import { mongodbEntities, mysqlEntities } from '@app/entity';
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
} from '@app/type/req';
import {
  ResGetGroupList,
  ResGetMenuCategoryList,
  ResGetMenuList,
  ResGetOptionList,
  ResSignIn,
  ResUploadGroup,
  ResUploadMenu,
  ResUploadMenuCategory,
  ResUploadOption,
} from '@app/type/res';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { MenuModule } from './menu.module';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let restaurantService: RestaurantService;
  let service: MenuService;
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

    service = module.get<MenuService>(MenuService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  afterAll(async () => {
    await getConnection('mysql').close();
    await getConnection('mongodb').close();
  });

  it('should success uploadMenuCategory()', async () => {
    await restaurantService.create(testRestaurant);
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: testRestaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);

    const [foundMenuCategory]: ResGetMenuCategoryList[] = await service.getMenuCategoryList(accessToken);
    const [requestMenuCategory, responseMenuCategory] =
      TestUtilService.makeElementComparable(testMenuCategory, foundMenuCategory, ['menuCategoryId']);

    expect(requestMenuCategory).toStrictEqual(responseMenuCategory);

    await service.removeMenuCategory([menuCategoryId]);

    await restaurantService.leave(accessToken);
  });

  it('should success editMenuCategory()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `2${testRestaurant.email}`, name: `${testRestaurant.name}_2`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);
    const editData: DtoEditMenuCategory = { menuCategoryId, name: 'etc' };

    await service.editMenuCategory(editData);

    const [foundMenuCategory]: ResGetMenuCategoryList[] = await service.getMenuCategoryList(accessToken);
    const [requestMenuCategory, responseMenuCategory] =
      TestUtilService.makeElementComparable(editData, foundMenuCategory, ['menuCategoryId']);

    expect(requestMenuCategory).toStrictEqual(responseMenuCategory);

    await service.removeMenuCategory([menuCategoryId]);

    await restaurantService.leave(accessToken);
  });

  it('should success uploadMenu()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `3${testRestaurant.email}`, name: `${testRestaurant.name}_3`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);
    const { menuId }: ResUploadMenu = await service.uploadMenu({ ...testMenu, menuCategoryId });

    const [foundMenu]: ResGetMenuList[] = await service.getMenuList({
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

    await service.removeMenu([menuId]);

    await restaurantService.leave(accessToken);
  });

  it('should success editMenu()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `4${testRestaurant.email}`, name: `${testRestaurant.name}_4`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);
    const { menuId }: ResUploadMenu =
      await service.uploadMenu({ ...testMenu, menuCategoryId });

    const editData: DtoEditMenu = {
      description: 'normal',
      image: 'url.image', menuId,
      name: 'fried chicken',
      price: 17000,
    };

    await service.editMenu({ ...editData, menuId });

    const [foundMenu]: ResGetMenuList[] = await service.getMenuList({
      menuCategoryId: menuCategoryId.toString(),
    });

    const [requestMenu, responseMenu] = TestUtilService
      .makeElementComparable(editData, foundMenu, ['menuId', 'menuCategoryId', 'group']);
    expect(requestMenu).toStrictEqual(responseMenu);

    await service.removeMenu([menuId]);

    await restaurantService.leave(accessToken);
  });

  it('should success uploadGroup()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `5${testRestaurant.email}`, name: `${testRestaurant.name}_5`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);
    const menu: DtoUploadMenu = { ...testMenu };

    Reflect.deleteProperty(menu, 'group');

    const { menuId }: ResUploadMenu = await service.uploadMenu({ ...menu, menuCategoryId });
    const { groupId }: ResUploadGroup = await service.uploadGroup({ ...testGroup, menuId });

    const [foundGroup]: ResGetGroupList[] = await service.getGroupList({ menuId: menuId.toString() });

    const [requestGroup, responseGroup] = TestUtilService
      .makeElementComparable(testGroup, foundGroup, ['groupId', 'menuId', 'option']);
    const [requestOption, responseOption] = TestUtilService
      .makeElementComparable(testGroup.option[0], foundGroup.option[0], ['optionId']);

    expect(requestGroup).toStrictEqual(responseGroup);
    expect(requestOption).toStrictEqual(responseOption);

    await service.removeGroup([groupId]);

    await restaurantService.leave(accessToken);
  });

  it('should success editGroup()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `6${testRestaurant.email}`, name: `${testRestaurant.name}_6`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);
    const menu: DtoUploadMenu = { ...testMenu };
    Reflect.deleteProperty(menu, 'group');
    const { menuId }: ResUploadMenu = await service.uploadMenu({ ...menu, menuCategoryId });
    const { groupId }: ResUploadGroup = await service.uploadGroup({ ...testGroup, menuId });

    const editData: DtoEditGroup = {
      groupId, maxCount: 0, name: 'etc',
    };

    await service.editGroup({ ...editData, groupId });

    const [foundGroup]: ResGetGroupList[] = await service.getGroupList({ menuId: menuId.toString() });

    const [requestGroup, responseGroup] = TestUtilService
      .makeElementComparable(editData, foundGroup, ['groupId', 'option']);
    expect(requestGroup).toStrictEqual(responseGroup);

    await service.removeGroup([groupId]);

    await restaurantService.leave(accessToken);
  });

  it('should success uploadOption()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `7${testRestaurant.email}`, name: `${testRestaurant.name}_7`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);
    const menu: DtoUploadMenu = { ...testMenu };
    Reflect.deleteProperty(menu.group[0], 'option');
    await service.uploadMenu({ ...menu, menuCategoryId });

    const [{ group: [{ groupId }] }]: ResGetMenuList[] =
      await service.getMenuList({ menuCategoryId: menuCategoryId.toString() });
    const { optionId }: ResUploadOption = await service.uploadOption({ ...testOption, groupId });

    const [foundOption]: ResGetOptionList[] = await service.getOptionList({ groupId: groupId.toString() });

    const [requestOption, responseOption] = TestUtilService
      .makeElementComparable(testOption, foundOption, ['groupId', 'optionId']);

    expect(requestOption).toStrictEqual(responseOption);

    await service.removeOption([optionId]);

    await restaurantService.leave(accessToken);
  });

  it('should success editOption()', async () => {
    const restaurant: { email: string; name: string } = {
      email: `7${testRestaurant.email}`, name: `${testRestaurant.name}_7`,
    };
    await restaurantService.create({ ...testRestaurant, ...restaurant });
    const { accessToken }: ResSignIn = await restaurantService.signIn({
      email: restaurant.email, password: testRestaurant.password,
    });

    const { menuCategoryId }: ResUploadMenuCategory =
      await service.uploadMenuCategory(accessToken, testMenuCategory);
    const menu: DtoUploadMenu = { ...testMenu };
    Reflect.deleteProperty(menu.group[0], 'option');
    await service.uploadMenu({ ...menu, menuCategoryId });
    const [{ group: [{ groupId }] }]: ResGetMenuList[] =
      await service.getMenuList({ menuCategoryId: menuCategoryId.toString() });
    const { optionId }: ResUploadOption = await service.uploadOption({ ...testOption, groupId });

    const editData: DtoEditOption = { name: 'onion', optionId, price: 600 };

    await service.editOption({ ...editData, optionId });

    const [foundOption]: ResGetOptionList[] = await service.getOptionList({ groupId: groupId.toString() });

    const [requestOption, responseOption] = TestUtilService
      .makeElementComparable(editData, foundOption, ['optionId']);
    expect(requestOption).toStrictEqual(responseOption);

    await service.removeOption([optionId]);

    await restaurantService.leave(accessToken);
  });
});
