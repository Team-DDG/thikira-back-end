import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, Group, Menu, MenuCategory, Option, Restaurant } from '@app/entity';
import {
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption, DtoUploadGroup,
  DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
  QueryGetGroupList, QueryGetMenuCategoryList, QueryGetMenuList, QueryGetOptionList,
} from '@app/type/req';
import {
  ResGetGroupList, ResGetMenuCategoryList, ResGetMenuList, ResGetOptionList,
  ResUploadGroup, ResUploadMenu, ResUploadMenuCategory, ResUploadOption,
} from '@app/type/res';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilService } from '@app/util';

@Injectable()
export class MenuService {
  @InjectRepository(Coupon, 'mysql')
  private readonly c_repo: Repository<Coupon>;
  @InjectRepository(Group, 'mysql')
  private readonly g_repo: Repository<Group>;
  @InjectRepository(Menu, 'mysql')
  private readonly m_repo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly mc_repo: Repository<MenuCategory>;
  @InjectRepository(Option, 'mysql')
  private readonly o_repo: Repository<Option>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly r_repo: Repository<Restaurant>;
  @Inject()
  private readonly util_service: UtilService;

  // menu_category

  public async upload_menu_category(
    token: string,
    payload: DtoUploadMenuCategory,
  ): Promise<ResUploadMenuCategory> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email });
    const f_menu_category: MenuCategory = await this.mc_repo.findOne({
      name: payload.name, restaurant: f_restaurant,
    });
    if (f_menu_category) {
      throw new ConflictException();
    }

    const menu_category: MenuCategory = new MenuCategory();
    Object.assign(menu_category, { ...payload, restaurant: f_restaurant });
    await this.mc_repo.insert(menu_category);
    return { mc_id: menu_category.mc_id };
  }

  public async get_menu_category_list(
    param: string | QueryGetMenuCategoryList,
  ): Promise<ResGetMenuCategoryList[]> {
    let f_restaurant: Restaurant;
    if ('string' === typeof param) {
      const email: string = this.util_service.get_email_by_token(param);
      f_restaurant = await this.r_repo.findOne({ email });
    } else {
      f_restaurant = await this.r_repo.findOne(parseInt(param.r_id));
    }

    const f_menu_categories: MenuCategory[] = await this.mc_repo.find({
      restaurant: f_restaurant,
    });

    if (!f_menu_categories) {
      throw new NotFoundException();
    }

    return f_menu_categories;
  }

  public async edit_menu_category(payload: DtoEditMenuCategory): Promise<void> {
    await this.mc_repo.update(payload.mc_id, payload);
  }

  public async remove_menu_category(mc_ids: number[]): Promise<void> {
    for (const e_id of mc_ids) {
      const f_menu_category: MenuCategory = await this.mc_repo.findOne(e_id);
      const f_menus: Menu[] = await this.m_repo.find({ menu_category: f_menu_category });
      const m_ids: number[] = [];
      for (const e_g of f_menus) {
        m_ids.push(e_g.m_id);
      }
      if (0 < m_ids.length) {
        await this.remove_menu(m_ids);
      }
    }
    await this.mc_repo.delete(mc_ids);
  }

  // menu

  public async upload_menu(payload: DtoUploadMenu): Promise<ResUploadMenu> {
    const f_menu_category: MenuCategory = await this.mc_repo.findOne(payload.mc_id);
    if (!f_menu_category) {
      throw new NotFoundException();
    }
    const f_menu: Menu = await this.m_repo.findOne({
      menu_category: f_menu_category, name: payload.name,
    });
    if (f_menu) {
      throw new ConflictException();
    }

    const menu: Menu = new Menu();
    for (const e of ['mc_id']) {
      Reflect.deleteProperty(menu, e);
    }
    Object.assign(menu, { ...payload, menu_category: f_menu_category });
    await this.m_repo.insert(menu);

    if (payload.group) {
      for (const e_g of payload.group) {
        const group: Group = new Group();
        Object.assign(group, { ...e_g, menu });
        await this.g_repo.insert(group);

        if (e_g.option) {
          for (const e_o of e_g.option) {
            const option: Option = new Option();
            Object.assign(option, { ...e_o, group });
            await this.o_repo.insert(option);
          }
        }
      }
    }

    return { m_id: menu.m_id };
  }

  public async get_menu_list(query: QueryGetMenuList): Promise<ResGetMenuList[]> {
    const f_menu_category: MenuCategory =
      await this.mc_repo.findOne(parseInt(query.mc_id));
    if (!f_menu_category) {
      throw new NotFoundException();
    }
    const f_menus: Menu[] = await this.m_repo.find({
      join: {
        alias: 'Menu',
        leftJoinAndSelect: {
          Group: 'Menu.group',
          Option: 'Group.option',
        },
      },
      where: { menu_category: f_menu_category },
    });

    if (!f_menus) {
      throw new NotFoundException();
    }
    return f_menus;
  }

  public async edit_menu(payload: DtoEditMenu): Promise<void> {
    await this.m_repo.update(payload.m_id, payload);
  }

  public async remove_menu(m_ids: number[]): Promise<void> {
    for (const e_id of m_ids) {
      const f_menu: Menu = await this.m_repo.findOne(e_id);
      const f_groups: Group[] = await this.g_repo.find({ menu: f_menu });
      const g_ids: number[] = [];
      for (const e_g of f_groups) {
        g_ids.push(e_g.g_id);
      }
      if (0 < g_ids.length) {
        await this.remove_group(g_ids);
      }
    }
    await this.m_repo.delete(m_ids);
  }

  // group

  public async upload_group(payload: DtoUploadGroup): Promise<ResUploadGroup> {
    const f_menu: Menu = await this.m_repo.findOne(payload.m_id);
    const f_group: Group = await this.g_repo.findOne({
      menu: f_menu, name: payload.name,
    });
    if (f_group) {
      throw new ConflictException();
    }

    const group: Group = new Group();
    for (const e of ['m_id']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(group, { ...payload, menu: f_menu });

    await this.g_repo.insert(group);

    if (payload.option) {
      for (const e_o of payload.option) {
        const option: Option = new Option();
        Object.assign(option, { ...e_o, group });
        await this.o_repo.insert(option);
      }

    }

    return { g_id: group.g_id };
  }

  public async get_group_list(query: QueryGetGroupList): Promise<ResGetGroupList[]> {
    const f_menu: Menu = await this.m_repo.findOne(parseInt(query.m_id));
    const f_groups: Group[] = await this.g_repo.find({
      join: { alias: 'Group', leftJoinAndSelect: { Option: 'Group.option' } },
      where: { menu: f_menu },
    });
    if (!f_groups) {
      throw new NotFoundException();
    }
    return f_groups;
  }

  public async edit_group(payload: DtoEditGroup): Promise<void> {
    await this.g_repo.update(payload.g_id, payload);
  }

  public async remove_group(g_ids: number[]): Promise<void> {
    for (const e_id of g_ids) {
      const f_group: Group = await this.g_repo.findOne(e_id);
      const f_options: Option[] = await this.o_repo.find({ group: f_group });
      const o_ids: number[] = [];
      for (const e_o of f_options) {
        o_ids.push(e_o.o_id);
      }
      if (0 < o_ids.length) {
        await this.remove_option(o_ids);
      }
    }
    await this.g_repo.delete(g_ids);
  }

  // option

  public async upload_option(payload: DtoUploadOption): Promise<ResUploadOption> {
    const f_group: Group = await this.g_repo.findOne(payload.g_id);
    const f_option: Option = await this.o_repo.findOne({
      group: f_group, name: payload.name,
    });
    if (f_option) {
      throw new ConflictException();
    }

    const option: Option = new Option();
    for (const e of ['g_id']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(option, { ...payload, group: f_group });
    await this.o_repo.insert(option);

    return { o_id: option.o_id };
  }

  public async get_option_list(query: QueryGetOptionList): Promise<ResGetOptionList[]> {
    const f_group: Group = await this.g_repo.findOne(parseInt(query.g_id));
    const f_options: Option[] = await this.o_repo.find({ group: f_group });
    if (!f_options) {
      throw new NotFoundException();
    }
    return f_options;
  }

  public async edit_option(payload: DtoEditOption): Promise<void> {
    await this.o_repo.update(payload.o_id, payload);
  }

  public async remove_option(o_ids: number[]): Promise<void> {
    await this.o_repo.delete(o_ids);
  }
}
