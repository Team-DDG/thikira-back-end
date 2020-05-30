import { AuthService } from '@app/auth';
import { Coupon, Group, Menu, MenuCategory, Option, Restaurant } from '@app/entity';
import { ParsedTokenClass } from '@app/type/etc';
import {
  DtoEditGroup,
  DtoEditMenu,
  DtoEditMenuCategory,
  DtoEditOption,
  DtoUploadGroup,
  DtoUploadMenu,
  DtoUploadMenuCategory,
  DtoUploadOption,
  QueryGetGroupList,
  QueryGetMenuCategoryList,
  QueryGetMenuList,
  QueryGetOptionList,
} from '@app/type/req';
import {
  ResGetGroupList,
  ResGetMenuCategoryList,
  ResGetMenuList,
  ResGetOptionList,
  ResUploadGroup,
  ResUploadMenu,
  ResUploadMenuCategory,
  ResUploadOption,
} from '@app/type/res';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MenuService {
  @InjectRepository(Coupon, 'mysql')
  private readonly couponRepo: Repository<Coupon>;
  @InjectRepository(Group, 'mysql')
  private readonly groupRepo: Repository<Group>;
  @InjectRepository(Menu, 'mysql')
  private readonly menuRepo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly menuCategoryRepo: Repository<MenuCategory>;
  @InjectRepository(Option, 'mysql')
  private readonly optionRepo: Repository<Option>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurantRepo: Repository<Restaurant>;
  @Inject()
  private readonly tokenService: AuthService;

  // menuCategory

  public async uploadMenuCategory(
    token: string,
    payload: DtoUploadMenuCategory,
  ): Promise<ResUploadMenuCategory> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    const foundMenuCategory: MenuCategory = await this.menuCategoryRepo.findOne({
      name: payload.name, restaurant: foundRestaurant,
    });
    if (foundMenuCategory) {
      throw new ConflictException();
    }

    const menuCategory: MenuCategory = new MenuCategory();
    Object.assign(menuCategory, { ...payload, restaurant: foundRestaurant });
    await this.menuCategoryRepo.insert(menuCategory);
    return { menuCategoryId: menuCategory.menuCategoryId };
  }

  public async getMenuCategoryList(
    param: string | QueryGetMenuCategoryList,
  ): Promise<ResGetMenuCategoryList[]> {
    let foundRestaurant: Restaurant;
    if ('string' === typeof param) {
      const { id }: ParsedTokenClass = this.tokenService.parseToken(param);
      foundRestaurant = await this.restaurantRepo.findOne(id);
    } else {
      foundRestaurant = await this.restaurantRepo.findOne(parseInt(param.restaurantId));
    }

    const foundMenuCategories: MenuCategory[] = await this.menuCategoryRepo.find({
      restaurant: foundRestaurant,
    });

    if (!foundMenuCategories) {
      throw new NotFoundException();
    }

    return foundMenuCategories;
  }

  public async editMenuCategory(payload: DtoEditMenuCategory): Promise<void> {
    await this.menuCategoryRepo.update(payload.menuCategoryId, payload);
  }

  public async removeMenuCategory(menuCategoryIds: number[]): Promise<void> {
    for (const elementId of menuCategoryIds) {
      const foundMenuCategory: MenuCategory = await this.menuCategoryRepo.findOne(elementId);
      const foundMenus: Menu[] = await this.menuRepo.find({ menuCategory: foundMenuCategory });
      const menuIds: number[] = [];
      for (const elementGroup of foundMenus) {
        menuIds.push(elementGroup.menuId);
      }
      if (0 < menuIds.length) {
        await this.removeMenu(menuIds);
      }
    }
    await this.menuCategoryRepo.delete(menuCategoryIds);
  }

  // menu

  public async uploadMenu(payload: DtoUploadMenu): Promise<ResUploadMenu> {
    const foundMenuCategory: MenuCategory = await this.menuCategoryRepo.findOne(payload.menuCategoryId);
    if (!foundMenuCategory) {
      throw new NotFoundException();
    }
    const foundMenu: Menu = await this.menuRepo.findOne({
      menuCategory: foundMenuCategory, name: payload.name,
    });
    if (foundMenu) {
      throw new ConflictException();
    }

    const menu: Menu = new Menu();
    for (const element of ['menuCategoryId']) {
      Reflect.deleteProperty(menu, element);
    }
    Object.assign(menu, { ...payload, menuCategory: foundMenuCategory });
    await this.menuRepo.insert(menu);

    if (payload.group) {
      for (const elementGroup of payload.group) {
        const group: Group = new Group();
        Object.assign(group, { ...elementGroup, menu });
        await this.groupRepo.insert(group);

        if (elementGroup.option) {
          for (const elementOption of elementGroup.option) {
            const option: Option = new Option();
            Object.assign(option, { ...elementOption, group });
            await this.optionRepo.insert(option);
          }
        }
      }
    }

    return { menuId: menu.menuId };
  }

  public async getMenuList(query: QueryGetMenuList): Promise<ResGetMenuList[]> {
    const foundMenuCategory: MenuCategory =
      await this.menuCategoryRepo.findOne(parseInt(query.menuCategoryId));
    if (!foundMenuCategory) {
      throw new NotFoundException();
    }
    const foundMenus: Menu[] = await this.menuRepo.find({
      join: {
        alias: 'Menu',
        leftJoinAndSelect: {
          Group: 'Menu.group',
          Option: 'Group.option',
        },
      },
      where: { menuCategory: foundMenuCategory },
    });

    if (!foundMenus) {
      throw new NotFoundException();
    }
    return foundMenus;
  }

  public async editMenu(payload: DtoEditMenu): Promise<void> {
    await this.menuRepo.update(payload.menuId, payload);
  }

  public async removeMenu(menuIds: number[]): Promise<void> {
    for (const elementId of menuIds) {
      const foundMenu: Menu = await this.menuRepo.findOne(elementId);
      const foundGroups: Group[] = await this.groupRepo.find({ menu: foundMenu });
      const groupIds: number[] = [];
      for (const elementGroup of foundGroups) {
        groupIds.push(elementGroup.groupId);
      }
      if (0 < groupIds.length) {
        await this.removeGroup(groupIds);
      }
    }
    await this.menuRepo.delete(menuIds);
  }

  // group

  public async uploadGroup(payload: DtoUploadGroup): Promise<ResUploadGroup> {
    const foundMenu: Menu = await this.menuRepo.findOne(payload.menuId);
    const foundGroup: Group = await this.groupRepo.findOne({
      menu: foundMenu, name: payload.name,
    });
    if (foundGroup) {
      throw new ConflictException();
    }

    const group: Group = new Group();
    for (const element of ['menuId']) {
      Reflect.deleteProperty(payload, element);
    }
    Object.assign(group, { ...payload, menu: foundMenu });

    await this.groupRepo.insert(group);

    if (payload.option) {
      for (const elementOption of payload.option) {
        const option: Option = new Option();
        Object.assign(option, { ...elementOption, group });
        await this.optionRepo.insert(option);
      }

    }

    return { groupId: group.groupId };
  }

  public async getGroupList(query: QueryGetGroupList): Promise<ResGetGroupList[]> {
    const foundMenu: Menu = await this.menuRepo.findOne(parseInt(query.menuId));
    const foundGroups: Group[] = await this.groupRepo.find({
      join: { alias: 'Group', leftJoinAndSelect: { Option: 'Group.option' } },
      where: { menu: foundMenu },
    });
    if (!foundGroups) {
      throw new NotFoundException();
    }
    return foundGroups;
  }

  public async editGroup(payload: DtoEditGroup): Promise<void> {
    await this.groupRepo.update(payload.groupId, payload);
  }

  public async removeGroup(groupIds: number[]): Promise<void> {
    for (const elementId of groupIds) {
      const foundGroup: Group = await this.groupRepo.findOne(elementId);
      const foundOptions: Option[] = await this.optionRepo.find({ group: foundGroup });
      const optionIds: number[] = [];
      for (const elementOption of foundOptions) {
        optionIds.push(elementOption.optionId);
      }
      if (0 < optionIds.length) {
        await this.removeOption(optionIds);
      }
    }
    await this.groupRepo.delete(groupIds);
  }

  // option

  public async uploadOption(payload: DtoUploadOption): Promise<ResUploadOption> {
    const foundGroup: Group = await this.groupRepo.findOne(payload.groupId);
    const foundOption: Option = await this.optionRepo.findOne({
      group: foundGroup, name: payload.name,
    });
    if (foundOption) {
      throw new ConflictException();
    }

    const option: Option = new Option();
    for (const element of ['groupId']) {
      Reflect.deleteProperty(payload, element);
    }
    Object.assign(option, { ...payload, group: foundGroup });
    await this.optionRepo.insert(option);

    return { optionId: option.optionId };
  }

  public async getOptionList(query: QueryGetOptionList): Promise<ResGetOptionList[]> {
    const foundGroup: Group = await this.groupRepo.findOne(parseInt(query.groupId));
    const foundOptions: Option[] = await this.optionRepo.find({ group: foundGroup });
    if (!foundOptions) {
      throw new NotFoundException();
    }
    return foundOptions;
  }

  public async editOption(payload: DtoEditOption): Promise<void> {
    await this.optionRepo.update(payload.optionId, payload);
  }

  public async removeOption(optionIds: number[]): Promise<void> {
    await this.optionRepo.delete(optionIds);
  }
}
