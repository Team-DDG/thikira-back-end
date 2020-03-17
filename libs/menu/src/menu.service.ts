import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption,
  DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
  QueryGetGroupList, QueryGetMenuCategoryList, QueryGetMenuList, QueryGetOptionList,
} from '@app/type/req';
import { Group, Menu, MenuCategory, Option, Restaurant } from '@app/db';
import {
  ResGetGroupList, ResGetMenuCategoryList, ResGetMenuList, ResGetOptionList,
  ResUploadGroup, ResUploadMenu, ResUploadMenuCategory, ResUploadOption,
} from '@app/type/res';
import { DBService } from '@app/db';
import { UtilService } from '@app/util';
import { plainToClass } from 'class-transformer';

@Injectable()
export class MenuService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  // menu_category

  public async upload_menu_category(token: string, payload: DtoUploadMenuCategory): Promise<ResUploadMenuCategory> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_r: Restaurant = await this.db_service.find_restaurant_by_email(email);
    const f_mc: MenuCategory = await this.db_service.find_menu_category_by_name(payload.name, f_r);
    if (f_mc) {
      throw new ConflictException();
    }

    const mc: MenuCategory = new MenuCategory();
    Object.assign(mc, { ...payload, r: f_r });
    await this.db_service.insert_menu_category(mc);
    return { mc_id: mc.mc_id };
  }

  public async get_menu_category_list(param: string | QueryGetMenuCategoryList): Promise<ResGetMenuCategoryList[]> {
    const res: ResGetMenuCategoryList[] = [];

    let f_r: Restaurant;
    if (typeof param === 'string') {
      const email: string = this.util_service.get_email_by_token(param);
      f_r = await this.db_service.find_restaurant_by_email(email);
    } else {
      f_r = await this.db_service.find_restaurant_by_id(parseInt(param.r_id));
    }
    const f_mc: MenuCategory[] =
      await this.db_service.find_menu_categories_by_restaurant(f_r, false);

    for (const e_mc of f_mc) {
      ['m', 'r'].map((e) => {
        Reflect.deleteProperty(e_mc, e);
      });
      res.push(e_mc);
    }
    return res;
  }

  public async edit_menu_category(payload: DtoEditMenuCategory): Promise<void> {
    await this.db_service.update_menu_category(payload.mc_id, payload);
  }

  public async remove_menu_category(mc_ids: number[]): Promise<void> {
    for (const e_id of mc_ids) {
      const f_mc: MenuCategory = await this.db_service.find_menu_category_by_id(e_id);
      const f_m_list: Menu[] = await this.db_service.find_menus_by_menu_category(f_mc);
      const m_ids: number[] = [];
      for (const e_g of f_m_list) {
        m_ids.push(e_g.m_id);
      }
      if (m_ids.length !== 0) {
        await this.remove_menu(m_ids);
      }
    }
    await this.db_service.delete_menu_category(mc_ids);
  }

  // menu

  public async upload_menu(payload: DtoUploadMenu): Promise<ResUploadMenu> {
    const f_mc: MenuCategory = await this.db_service.find_menu_category_by_id(payload.mc_id);
    const f_m: Menu = await this.db_service.find_menu_by_name(payload.name, f_mc);
    if (f_m) {
      throw new ConflictException();
    }

    const m: Menu = new Menu();
    Reflect.deleteProperty(m, 'mc_id');
    Object.assign(m, { ...payload, mc: f_mc });
    await this.db_service.insert_menu(m);

    if (payload.g) {
      for (const e_g of payload.g) {
        const g: Group = new Group();
        Object.assign(g, { ...e_g, m });
        await this.db_service.insert_group(g);

        if (e_g.o) {
          for (const e_o of e_g.o) {
            const o: Option = new Option();
            Object.assign(o, { ...e_o, g });
            await this.db_service.insert_option(o);
          }
        }
      }
    }

    return { m_id: m.m_id };
  }

  public async get_menu_list(query: QueryGetMenuList): Promise<ResGetMenuList[]> {
    const res: ResGetMenuList[] = [];
    const f_mc: MenuCategory = await this.db_service.find_menu_category_by_id(parseInt(query.mc_id));
    if (!f_mc) {
      throw new NotFoundException();
    }
    const f_m_list: Menu[] = await this.db_service.find_menus_by_menu_category(f_mc);
    for (const e_m of f_m_list) {
      const menu: ResGetMenuList = plainToClass(ResGetMenuList, e_m);
      res.push(menu);
      for (const e_g of e_m.g) {
        const group: ResGetGroupList = plainToClass(ResGetGroupList, e_g);
        menu.g.push(group);
        for (const e_o of e_g.o) {
          const o: ResGetOptionList = plainToClass(ResGetOptionList, e_o);
          group.o.push(o);
        }
      }
    }
    return res;
  }

  public async edit_menu(payload: DtoEditMenu): Promise<void> {
    await this.db_service.update_menu(payload.m_id, payload);
  }

  public async remove_menu(m_ids: number[]): Promise<void> {
    for (const e_id of m_ids) {
      const f_m: Menu = await this.db_service.find_menu_by_id(e_id);
      const f_g_list: Group[] = await this.db_service.find_groups_by_menu(f_m);
      const g_ids: number[] = [];
      for (const e_g of f_g_list) {
        g_ids.push(e_g.g_id);
      }
      if (g_ids.length !== 0) {
        await this.remove_group(g_ids);
      }
    }
    await this.db_service.delete_menu(m_ids);
  }

  // group

  public async upload_group(payload: DtoUploadGroup): Promise<ResUploadGroup> {
    const f_m: Menu = await this.db_service.find_menu_by_id(payload.m_id);
    const f_g: Group = await this.db_service.find_group_by_name(payload.name, f_m);
    if (f_g) {
      throw new ConflictException();
    }

    const group: Group = new Group();
    Reflect.deleteProperty(payload, 'm_id');
    Object.assign(group, { ...payload, m: f_m });

    await this.db_service.insert_group(group);

    return { g_id: group.g_id };
  }

  public async get_group_list(query: QueryGetGroupList): Promise<ResGetGroupList[]> {
    const res: ResGetGroupList[] = [];
    const f_m: Menu = await this.db_service.find_menu_by_id(parseInt(query.m_id));
    const f_g_list: Group[] = await this.db_service.find_groups_by_menu(f_m);

    for (const e_g of f_g_list) {
      const group: ResGetGroupList = plainToClass(ResGetGroupList, e_g);
      res.push(group);
      for (const e_o of e_g.o) {
        const o: ResGetOptionList = plainToClass(ResGetOptionList, e_o);
        group.o.push(o);
      }
    }

    return res;
  }

  public async edit_group(payload: DtoEditGroup): Promise<void> {
    await this.db_service.update_group(payload.g_id, payload);
  }

  public async remove_group(g_ids: number[]): Promise<void> {
    for (const e_id of g_ids) {
      const f_g: Group = await this.db_service.find_group_by_id(e_id);
      const f_o_list: Option[] = await this.db_service.find_options_by_group(f_g);
      const o_ids: number[] = [];
      for (const e_o of f_o_list) {
        o_ids.push(e_o.o_id);
      }
      if (o_ids.length !== 0) {
        await this.remove_option(o_ids);
      }
    }
    await this.db_service.delete_group(g_ids);
  }

  // option

  public async upload_option(payload: DtoUploadOption): Promise<ResUploadOption> {
    const f_g: Group = await this.db_service.find_group_by_id(payload.g_id);
    const f_o: Option = await this.db_service.find_option_by_name(payload.name, f_g);
    if (f_o) {
      throw new ConflictException();
    }

    const o: Option = new Option();
    Reflect.deleteProperty(payload, 'g_id');
    Object.assign(o, { ...payload, g: f_g });
    await this.db_service.insert_option(o);

    return { o_id: o.o_id };
  }

  public async get_option_list(query: QueryGetOptionList): Promise<ResGetOptionList[]> {
    const res: ResGetOptionList[] = [];
    const f_g: Group = await this.db_service.find_group_by_id(parseInt(query.g_id));
    const f_o_list: Option[] = await this.db_service.find_options_by_group(f_g);
    for (const e_o of f_o_list) {
      const o: ResGetOptionList = plainToClass(ResGetOptionList, e_o);
      res.push(o);
    }

    return res;
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
