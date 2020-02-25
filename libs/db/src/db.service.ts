import { ConfigService } from '@app/config';
import { UtilService } from '@app/util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { Group, Menu, MenuCategory, Option, Restaurant, User } from './entity';

@Injectable()
export class DBService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurant_repo: Repository<Restaurant>,
    @InjectRepository(User)
    private readonly user_repo: Repository<User>,
    @InjectRepository(Menu)
    private readonly menu_repo: Repository<Menu>,
    @InjectRepository(MenuCategory)
    private readonly menu_category_repo: Repository<MenuCategory>,
    @InjectRepository(Option)
    private readonly option_repo: Repository<Option>,
    @InjectRepository(Group)
    private readonly group_repo: Repository<Group>,
    private readonly config_service: ConfigService,
    private readonly util_service: UtilService,
  ) {
  }

  // restaurant

  public async insert_restaurant(restaurant: Restaurant) {
    await this.restaurant_repo.insert(restaurant);
  }

  public async find_restaurant_by_id(id: number) {
    return new Restaurant(await this.restaurant_repo.findOne(id));
  }

  public async find_restaurant_by_email(email: string): Promise<Restaurant> {
    return new Restaurant(await this.restaurant_repo.findOne({ r_email: email }));
  }

  public async find_restaurant_by_name(name: string) {
    return new Restaurant(await this.restaurant_repo.findOne({ r_name: name }));
  }

  public async find_restaurants_by_category(category: string) {
    const found_restaurant: Restaurant[] = await this.restaurant_repo.find({ r_category: category });
    const result: Restaurant[] = new Array<Restaurant>();
    for (const loop_restaurant of found_restaurant) {
      result.push(new Restaurant(loop_restaurant));
    }
    return result;
  }

  public async update_restaurant(email: string, payload): Promise<void> {
    if (payload.r_password) {
      payload.r_password = await this.util_service.encode(payload.r_password);
    }
    await this.restaurant_repo.update({ r_email: email }, payload);
  }

  public async delete_restaurant(email: string): Promise<void> {
    await this.restaurant_repo.delete({ r_email: email });
  }

  // user

  public async insert_user(user: User): Promise<void> {
    await this.user_repo.insert(user);
  }

  public async find_user_by_nickname(nickname: string): Promise<User> {
    return new User(await this.user_repo.findOne({ u_nickname: nickname }));
  }

  public async find_user_by_email(email: string): Promise<User> {
    return new User(await this.user_repo.findOne({ u_email: email }));
  }

  public async update_user(email: string, payload): Promise<void> {
    if (payload.u_password) {
      payload.u_password = await this.util_service.encode(payload.u_password);
    }
    await this.user_repo.update({ u_email: email }, payload);
  }

  public async delete_user(email: string): Promise<void> {
    await this.user_repo.delete({ u_email: email });
  }

  // menu_category

  public async insert_menu_category(menu_category: MenuCategory): Promise<void> {
    await this.menu_category_repo.insert(menu_category);
  }

  public async find_menu_category_by_id(id: number): Promise<MenuCategory> {
    return new MenuCategory(await this.menu_category_repo.findOne(id));
  }

  public async find_menu_category_by_name(name: string, restaurant: Restaurant): Promise<MenuCategory> {
    return new MenuCategory(await this.menu_category_repo.findOne({ mc_name: name, restaurant }));
  }

  public async find_menu_categories_by_restaurant(restaurant: Restaurant): Promise<MenuCategory[]> {
    const result: MenuCategory[] = new Array<MenuCategory>();

    const found_menu_categories: MenuCategory[] = await this.menu_category_repo.find({ where: { restaurant } });
    for (const loop_menu_category of found_menu_categories) {
      result.push(new MenuCategory(loop_menu_category));
    }
    return result;
  }

  public async update_menu_category(id: number, payload): Promise<void> {
    await this.menu_category_repo.update(id, payload);
  }

  public async delete_menu_category(id: number[]): Promise<void> {
    await this.menu_category_repo.delete(id);
  }

  // menu

  public async insert_menu(menu: Menu | Menu[]): Promise<void> {
    await this.menu_repo.insert(menu);
  }

  public async find_menu_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne(id));
  }

  public async find_menu_by_name(name: string, menu_category: MenuCategory): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne({ m_name: name, menu_category }));
  }

  public async find_menus_by_menu_category(menu_category: MenuCategory): Promise<Menu[]> {
    const result: Menu[] = new Array<Menu>();
    const found_data = await getManager()
      .query(
        `SELECT * FROM ${this.config_service.DB_SCHEMA}.menu AS m
            LEFT JOIN ${this.config_service.DB_SCHEMA}.group AS g ON m.m_id = g.f_m_id
            LEFT JOIN ${this.config_service.DB_SCHEMA}.option AS o ON g.g_id = o.f_g_id
            WHERE m.f_mc_id = ${menu_category.mc_id}`,
      );
    const options = {};
    for (const loop of found_data) {
      if (loop.o_id === null) {
        continue;
      }
      if (options[loop.f_g_id] === undefined) {
        options[loop.g_id] = new Array<Option>();
      }
      options[loop.g_id].push(new Option(loop));

    }
    const groups = {};

    let previous_id = null;
    for (const loop of found_data) {
      if (loop.g_id === null || previous_id === loop.g_id) {
        continue;
      }
      previous_id = loop.g_id;
      if (groups[loop.m_id] === undefined) {
        groups[loop.m_id] = new Array<Group>();
      }
      const group: Group = new Group(loop);
      groups[loop.m_id].push(group);
      if (options[loop.g_id] !== undefined) {
        for (const loop_option of options[loop.g_id]) {
          group.option.push(loop_option);
        }
      }
    }

    previous_id = null;
    for (const loop of found_data) {
      if (loop.m_id === null || previous_id === loop.m_id) {
        continue;
      }
      previous_id = loop.m_id;
      const menu: Menu = new Menu(loop);
      result.push(menu);
      if (groups[loop.m_id] !== undefined) {
        for (const loop_group of groups[loop.m_id]) {
          menu.group.push(loop_group);
        }
      }
    }
    return result;
  }

  public async update_menu(id: number, payload): Promise<void> {
    await this.menu_repo.update(id, payload);
  }

  public async delete_menu(id: number[]): Promise<void> {
    await this.menu_repo.delete(id);
  }

  // group

  public async insert_group(group: Group | Group[]) {
    if (group instanceof Group) {
      await this.group_repo.insert(group);
    } else {
      for (const loop_group of group) {
        await this.group_repo.insert(loop_group);
      }
    }
  }

  public async find_group_by_id(id: number): Promise<Group> {
    return new Group(await this.group_repo.findOne(id));
  }

  public async find_group_by_name(name: string, menu: Menu): Promise<Group> {
    return new Group(await this.group_repo.findOne({ g_name: name, menu }));
  }

  public async find_groups_by_menu(menu: Menu): Promise<Group[]> {
    const result: Group[] = new Array<Group>();
    const found_groups: Group[] = await this.group_repo.find({
      where: { menu },
      join: { alias: 'Group', leftJoinAndSelect: { Option: 'Group.option' } },
    });

    for (const loop_group of found_groups) {
      const group: Group = new Group(loop_group);
      result.push(group);
      for (const loop_option of loop_group.option) {
        const option: Option = new Option(loop_option);
        group.option.push(option);
      }
    }

    return result;
  }

  public async update_group(id: number, payload): Promise<void> {
    await this.group_repo.update(id, payload);
  }

  public async delete_group(id: number[]): Promise<void> {
    await this.group_repo.delete(id);
  }

  // option

  public async insert_option(option: Option | Option[]) {
    await this.option_repo.insert(option);
  }

  public async find_option_by_id(id: number): Promise<Option> {
    return new Option(await this.option_repo.findOne(id));
  }

  public async find_option_by_name(name: string, group: Group): Promise<Option> {
    return new Option(await this.option_repo.findOne({ o_name: name, group }));
  }

  public async find_options_by_group(group: Group): Promise<Option[]> {
    const result: Option[] = new Array<Option>();
    const found_options: Option[] = await this.option_repo.find({ where: { group } });

    for (const loop_option of found_options) {
      result.push(new Option(loop_option));
    }
    return result;
  }

  public async update_option(id: number, payload): Promise<void> {
    await this.option_repo.update(id, payload);
  }

  public async delete_option(id: number[]): Promise<void> {
    await this.option_repo.delete(id);
  }
}
