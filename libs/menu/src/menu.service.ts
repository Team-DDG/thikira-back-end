import { AuthService } from '@app/auth';
import { Coupon, Group, Menu, MenuCategory, Option, Restaurant } from '@app/entity';
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
  ResGetGroupList,
  ResGetMenuCategoryList,
  ResGetMenuList,
  ResGetOptionList,
  ResUploadGroup,
  ResUploadMenu,
  ResUploadMenuCategory,
  ResUploadOption,
} from '@app/type';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MenuService {
  @InjectRepository(Coupon, 'mysql')
  private readonly coupon_repo: Repository<Coupon>;
  @InjectRepository(Group, 'mysql')
  private readonly group_repo: Repository<Group>;
  @InjectRepository(Menu, 'mysql')
  private readonly menu_repo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly menu_category_repo: Repository<MenuCategory>;
  @InjectRepository(Option, 'mysql')
  private readonly option_repo: Repository<Option>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurant_repo: Repository<Restaurant>;
  @Inject()
  private readonly auth_service: AuthService;

  // menu_category

  public async uploadMenuCategory(
    id: number,
    payload: DtoUploadMenuCategory,
  ): Promise<ResUploadMenuCategory> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);
    const found_menu_category: MenuCategory = await this.menu_category_repo.findOne({
      name: payload.name, restaurant: found_restaurant,
    });
    if (found_menu_category) {
      throw new ConflictException();
    }

    const menu_category: MenuCategory = new MenuCategory();
    Object.assign(menu_category, { ...payload, restaurant: found_restaurant });
    await this.menu_category_repo.insert(menu_category);
    return { mc_id: menu_category.mc_id };
  }

  public async getMenuCategoryList(
    param: number | QueryGetMenuCategoryList,
  ): Promise<ResGetMenuCategoryList[]> {
    let found_restaurant: Restaurant;
    if ('number' === typeof param) {
      found_restaurant = await this.restaurant_repo.findOne(param);
    } else {
      found_restaurant = await this.restaurant_repo.findOne(parseInt(param.r_id));
    }

    const found_menu_categories: MenuCategory[] = await this.menu_category_repo.find({
      restaurant: found_restaurant,
    });

    if (!found_menu_categories) {
      throw new NotFoundException();
    }

    return found_menu_categories;
  }

  public async editMenuCategory(payload: DtoEditMenuCategory): Promise<void> {
    await this.menu_category_repo.update(payload.mc_id, payload);
  }

  public async removeMenuCategory(mc_ids: number[]): Promise<void> {
    for (const e_id of mc_ids) {
      const found_menu_category: MenuCategory = await this.menu_category_repo.findOne(e_id);
      const found_menus: Menu[] = await this.menu_repo.find({ menu_category: found_menu_category });
      const m_ids: number[] = [];
      for (const e_group of found_menus) {
        m_ids.push(e_group.m_id);
      }
      if (0 < m_ids.length) {
        await this.removeMenu(m_ids);
      }
    }
    await this.menu_category_repo.delete(mc_ids);
  }

  // menu

  public async uploadMenu(payload: DtoUploadMenu): Promise<ResUploadMenu> {
    const found_menu_category: MenuCategory = await this.menu_category_repo.findOne(payload.mc_id);
    if (!found_menu_category) {
      throw new NotFoundException();
    }
    const found_menu: Menu = await this.menu_repo.findOne({
      menu_category: found_menu_category, name: payload.name,
    });
    if (found_menu) {
      throw new ConflictException();
    }

    const menu: Menu = new Menu();
    for (const e of ['mc_id']) {
      Reflect.deleteProperty(menu, e);
    }
    Object.assign(menu, { ...payload, menu_category: found_menu_category });
    await this.menu_repo.insert(menu);

    if (payload.group) {
      for (const e_group of payload.group) {
        const group: Group = new Group();
        Object.assign(group, { ...e_group, menu });
        await this.group_repo.insert(group);

        if (e_group.option) {
          for (const e_option of e_group.option) {
            const option: Option = new Option();
            Object.assign(option, { ...e_option, group });
            await this.option_repo.insert(option);
          }
        }
      }
    }

    return { m_id: menu.m_id };
  }

  public async getMenuList(query: QueryGetMenuList): Promise<ResGetMenuList[]> {
    const found_menu_category: MenuCategory =
      await this.menu_category_repo.findOne(parseInt(query.mc_id));
    if (!found_menu_category) {
      throw new NotFoundException();
    }
    const found_menus: Menu[] = await this.menu_repo.find({
      join: {
        alias: 'Menu',
        leftJoinAndSelect: {
          Group: 'Menu.group',
          Option: 'Group.option',
        },
      },
      where: { menu_category: found_menu_category },
    });

    if (!found_menus) {
      throw new NotFoundException();
    }
    return found_menus;
  }

  public async editMenu(payload: DtoEditMenu): Promise<void> {
    await this.menu_repo.update(payload.m_id, payload);
  }

  public async removeMenu(m_ids: number[]): Promise<void> {
    for (const e_id of m_ids) {
      const found_menu: Menu = await this.menu_repo.findOne(e_id);
      const found_groups: Group[] = await this.group_repo.find({ menu: found_menu });
      const g_ids: number[] = [];
      for (const e_group of found_groups) {
        g_ids.push(e_group.g_id);
      }
      if (0 < g_ids.length) {
        await this.removeGroup(g_ids);
      }
    }
    await this.menu_repo.delete(m_ids);
  }

  // group

  public async uploadGroup(payload: DtoUploadGroup): Promise<ResUploadGroup> {
    const num_of_group: number = await this.group_repo.count({
      menu: { m_id: payload.m_id }, name: payload.name,
    });
    if (num_of_group > 0) {
      throw new ConflictException();
    }

    const group: Group = new Group();
    const m_id: number = payload.m_id;
    for (const e of ['m_id']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(group, { ...payload, menu: { m_id } });

    await this.group_repo.insert(group);

    if (payload.option) {
      for (const e_option of payload.option) {
        const option: Option = new Option();
        Object.assign(option, { ...e_option, group });
        await this.option_repo.insert(option);
      }

    }

    return { g_id: group.g_id };
  }

  public async getGroupList(query: QueryGetGroupList): Promise<ResGetGroupList[]> {
    const found_menu: Menu = await this.menu_repo.findOne(parseInt(query.m_id));
    const found_groups: Group[] = await this.group_repo.find({
      join: { alias: 'Group', leftJoinAndSelect: { Option: 'Group.option' } },
      where: { menu: found_menu },
    });
    if (!found_groups) {
      throw new NotFoundException();
    }
    return found_groups;
  }

  public async editGroup(payload: DtoEditGroup): Promise<void> {
    await this.group_repo.update(payload.g_id, payload);
  }

  public async removeGroup(g_ids: number[]): Promise<void> {
    for (const e_id of g_ids) {
      const found_group: Group = await this.group_repo.findOne(e_id);
      const found_options: Option[] = await this.option_repo.find({ group: found_group });
      const o_ids: number[] = [];
      for (const e_option of found_options) {
        o_ids.push(e_option.o_id);
      }
      if (0 < o_ids.length) {
        await this.removeOption(o_ids);
      }
    }
    await this.group_repo.delete(g_ids);
  }

  // option

  public async uploadOption(payload: DtoUploadOption): Promise<ResUploadOption> {
    const found_group: Group = await this.group_repo.findOne(payload.g_id);
    const found_option: Option = await this.option_repo.findOne({
      group: found_group, name: payload.name,
    });
    if (found_option) {
      throw new ConflictException();
    }

    const option: Option = new Option();
    for (const e of ['g_id']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(option, { ...payload, group: found_group });
    await this.option_repo.insert(option);

    return { o_id: option.o_id };
  }

  public async getOptionList(query: QueryGetOptionList): Promise<ResGetOptionList[]> {
    const found_group: Group = await this.group_repo.findOne(parseInt(query.g_id));
    const found_options: Option[] = await this.option_repo.find({ group: found_group });
    if (!found_options) {
      throw new NotFoundException();
    }
    return found_options;
  }

  public async editOption(payload: DtoEditOption): Promise<void> {
    await this.option_repo.update(payload.o_id, payload);
  }

  public async removeOption(o_ids: number[]): Promise<void> {
    await this.option_repo.delete(o_ids);
  }
}
