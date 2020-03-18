import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DBService, Group, Menu, MenuCategory, Option, Restaurant } from '@app/db';
import {
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption, DtoUploadGroup,
  DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
  QueryGetGroupList, QueryGetMenuCategoryList, QueryGetMenuList, QueryGetOptionList,
} from '@app/type/req';
import {
  ResGetGroupList, ResGetMenuCategoryList, ResGetMenuList, ResGetOptionList,
  ResUploadGroup, ResUploadMenu, ResUploadMenuCategory, ResUploadOption,
} from '@app/type/res';
import { UtilService } from '@app/util';

@Injectable()
export class MenuService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  // menu_category

  public async upload_menu_category(token: string, payload: DtoUploadMenuCategory): Promise<ResUploadMenuCategory> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    const f_menu_category: MenuCategory = await this.db_service.find_menu_category_by_name(payload.name, f_restaurant);
    if (f_menu_category) {
      throw new ConflictException();
    }

    const menu_category: MenuCategory = new MenuCategory();
    Object.assign(menu_category, { ...payload, restaurant: f_restaurant });
    await this.db_service.insert_menu_category(menu_category);
    return { mc_id: menu_category.mc_id };
  }

  public async get_menu_category_list(param: string | QueryGetMenuCategoryList): Promise<ResGetMenuCategoryList[]> {
    let f_restaurant: Restaurant;
    if (typeof param === 'string') {
      const email: string = this.util_service.get_email_by_token(param);
      f_restaurant = await this.db_service.find_restaurant_by_email(email);
    } else {
      f_restaurant = await this.db_service.find_restaurant_by_id(parseInt(param.r_id));
    }

    const f_menu_categories: MenuCategory[] = await this.db_service.find_menu_categories_by_restaurant(f_restaurant, false);

    if (f_menu_categories.length < 1) {
      throw new NotFoundException();
    }

    return f_menu_categories;
  }

  public async edit_menu_category(payload: DtoEditMenuCategory): Promise<void> {
    await this.db_service.update_menu_category(payload.mc_id, payload);
  }

  public async remove_menu_category(mc_ids: number[]): Promise<void> {
    for (const e_id of mc_ids) {
      const f_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(e_id);
      const f_menus: Menu[] = await this.db_service.find_menus_by_menu_category(f_menu_category);
      const m_ids: number[] = [];
      for (const e_g of f_menus) {
        m_ids.push(e_g.m_id);
      }
      if (m_ids.length > 0) {
        await this.remove_menu(m_ids);
      }
    }
    await this.db_service.delete_menu_category(mc_ids);
  }

  // menu

  public async upload_menu(payload: DtoUploadMenu): Promise<ResUploadMenu> {
    const f_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(payload.mc_id);
    if (!f_menu_category) {
      throw new NotFoundException();
    }
    const f_menu: Menu = await this.db_service.find_menu_by_name(payload.name, f_menu_category);
    if (f_menu) {
      throw new ConflictException();
    }

    const menu: Menu = new Menu();
    Reflect.deleteProperty(menu, 'mc_id');
    Object.assign(menu, { ...payload, menu_category: f_menu_category });
    await this.db_service.insert_menu(menu);

    if (payload.group) {
      for (const e_g of payload.group) {
        const group: Group = new Group();
        Object.assign(group, { ...e_g, menu });
        await this.db_service.insert_group(group);

        if (e_g.option) {
          for (const e_o of e_g.option) {
            const option: Option = new Option();
            Object.assign(option, { ...e_o, group });
            await this.db_service.insert_option(option);
          }
        }
      }
    }

    return { m_id: menu.m_id };
  }

  public async get_menu_list(query: QueryGetMenuList): Promise<ResGetMenuList[]> {
    const f_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(parseInt(query.mc_id));
    if (!f_menu_category) {
      throw new NotFoundException();
    }
    const f_menus: Menu[] = await this.db_service.find_menus_by_menu_category(f_menu_category);
    if (f_menus.length < 1) {
      throw new NotFoundException();
    }
    return f_menus;
  }

  public async edit_menu(payload: DtoEditMenu): Promise<void> {
    await this.db_service.update_menu(payload.m_id, payload);
  }

  public async remove_menu(m_ids: number[]): Promise<void> {
    for (const e_id of m_ids) {
      const f_menu: Menu = await this.db_service.find_menu_by_id(e_id);
      const f_groups: Group[] = await this.db_service.find_groups_by_menu(f_menu);
      const g_ids: number[] = [];
      for (const e_g of f_groups) {
        g_ids.push(e_g.g_id);
      }
      if (g_ids.length > 0) {
        await this.remove_group(g_ids);
      }
    }
    await this.db_service.delete_menu(m_ids);
  }

  // group

  public async upload_group(payload: DtoUploadGroup): Promise<ResUploadGroup> {
    const f_menu: Menu = await this.db_service.find_menu_by_id(payload.m_id);
    const f_group: Group = await this.db_service.find_group_by_name(payload.name, f_menu);
    if (f_group) {
      throw new ConflictException();
    }

    const group: Group = new Group();
    Reflect.deleteProperty(payload, 'm_id');
    Object.assign(group, { ...payload, menu: f_menu });

    await this.db_service.insert_group(group);

    if (payload.option) {
      for (const e_o of payload.option) {
        const option: Option = new Option();
        Object.assign(option, { ...e_o, group });
        await this.db_service.insert_option(option);
      }

    }

    return { g_id: group.g_id };
  }

  public async get_group_list(query: QueryGetGroupList): Promise<ResGetGroupList[]> {
    const f_menu: Menu = await this.db_service.find_menu_by_id(parseInt(query.m_id));
    const f_groups: Group[] = await this.db_service.find_groups_by_menu(f_menu);
    if (f_groups.length < 1) {
      throw new NotFoundException();
    }
    return f_groups;
  }

  public async edit_group(payload: DtoEditGroup): Promise<void> {
    await this.db_service.update_group(payload.g_id, payload);
  }

  public async remove_group(g_ids: number[]): Promise<void> {
    for (const e_id of g_ids) {
      const f_group: Group = await this.db_service.find_group_by_id(e_id);
      const f_options: Option[] = await this.db_service.find_options_by_group(f_group);
      const o_ids: number[] = [];
      for (const e_o of f_options) {
        o_ids.push(e_o.o_id);
      }
      if (o_ids.length > 0) {
        await this.remove_option(o_ids);
      }
    }
    await this.db_service.delete_group(g_ids);
  }

  // option

  public async upload_option(payload: DtoUploadOption): Promise<ResUploadOption> {
    const f_group: Group = await this.db_service.find_group_by_id(payload.g_id);
    const f_option: Option = await this.db_service.find_option_by_name(payload.name, f_group);
    if (f_option) {
      throw new ConflictException();
    }

    const option: Option = new Option();
    Reflect.deleteProperty(payload, 'g_id');
    Object.assign(option, { ...payload, group: f_group });
    await this.db_service.insert_option(option);

    return { o_id: option.o_id };
  }

  public async get_option_list(query: QueryGetOptionList): Promise<ResGetOptionList[]> {
    const f_group: Group = await this.db_service.find_group_by_id(parseInt(query.g_id));
    const f_options: Option[] = await this.db_service.find_options_by_group(f_group);
    if (f_options.length < 1) {
      throw new NotFoundException();
    }
    return f_options;
  }

  public async edit_option(payload: DtoEditOption): Promise<void> {
    await this.db_service.update_option(payload.o_id, payload);
  }

  public async remove_option(o_ids: number[]): Promise<void> {
    await this.db_service.delete_option(o_ids);
  }

  // only use in test

  public async get_menu_category(menu_category_id: number): Promise<MenuCategory> {
    return this.db_service.find_menu_category_by_id(menu_category_id);
  }

  public async get_menu(menu_id: number): Promise<Menu> {
    return this.db_service.find_menu_by_id(menu_id);
  }

  public async get_group(group_id: number): Promise<Group> {
    return this.db_service.find_group_by_id(group_id);
  }

  public async get_option(option_id: number): Promise<Option> {
    return this.db_service.find_option_by_id(option_id);
  }
}
