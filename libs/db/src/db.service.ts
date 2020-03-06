import { Coupon, Group, Menu, MenuCategory, Option, Order, Restaurant, User } from './entity';
import { Inject, Injectable } from '@nestjs/common';
import { MongoRepository, ObjectID, Repository, getManager } from 'typeorm';
import { EnumPaymentType } from './enum';
import { InjectRepository } from '@nestjs/typeorm';
import { UtilService } from '@app/util';
import { config } from '@app/config';

@Injectable()
export class DBService {
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurant_repo: Repository<Restaurant>;
  @InjectRepository(User, 'mysql')
  private readonly user_repo: Repository<User>;
  @InjectRepository(Menu, 'mysql')
  private readonly menu_repo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly menu_category_repo: Repository<MenuCategory>;
  @InjectRepository(Option, 'mysql')
  private readonly option_repo: Repository<Option>;
  @InjectRepository(Group, 'mysql')
  private readonly group_repo: Repository<Group>;
  @InjectRepository(Coupon, 'mysql')
  private readonly coupon_repo: Repository<Coupon>;
  @InjectRepository(Order, 'mongodb')
  private readonly order_repo: MongoRepository<Order>;
  @Inject()
  private readonly util_service: UtilService;

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

  public async find_menu_categories_by_restaurant(restaurant: Restaurant, are_with_menu: boolean): Promise<MenuCategory[]> {
    const result: MenuCategory[] = new Array<MenuCategory>();
    if (are_with_menu) {
      const found_data = await getManager('mysql')
        .query(`SELECT * FROM ${config.MYSQL_SCHEMA}.menu_category AS mc
            LEFT JOIN ${config.MYSQL_SCHEMA}.menu AS m ON mc.mc_id = m.f_mc_id
            LEFT JOIN ${config.MYSQL_SCHEMA}.group AS g ON m.m_id = g.f_m_id
            LEFT JOIN ${config.MYSQL_SCHEMA}.option AS o ON g.g_id = o.f_g_id
            WHERE mc.f_r_id=${restaurant.r_id}`);

      const options = {};
      for (const loop of found_data) {
        if (loop.o_id !== null) {
          if (options[loop.f_g_id] === undefined) {
            options[loop.g_id] = new Array<Option>();
          }
          options[loop.g_id].push(new Option(loop));
        }
      }

      const groups = {};
      let previous_id = null;
      for (const loop of found_data) {
        if (loop.g_id !== null && previous_id !== loop.g_id) {
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
      }

      const menus = {};
      previous_id = null;
      for (const loop of found_data) {
        if (loop.m_id !== null && previous_id !== loop.m_id) {
          previous_id = loop.m_id;
          if (menus[loop.mc_id] === undefined) {
            menus[loop.mc_id] = new Array<Menu>();
          }
          const menu: Menu = new Menu(loop);
          menus[loop.mc_id].push(menu);
          if (groups[loop.m_id] !== undefined) {
            for (const loop_group of groups[loop.m_id]) {
              menu.group.push(loop_group);
            }
          }
        }
      }

      previous_id = null;
      for (const loop of found_data) {
        if (loop.mc_id !== null && previous_id !== loop.mc_id) {
          previous_id = loop.mc_id;
          const menu_category: MenuCategory = new MenuCategory(loop);
          result.push(menu_category);
          if (menus[loop.mc_id] !== undefined) {
            for (const loop_menu of menus[loop.mc_id]) {
              menu_category.menu.push(loop_menu);
            }
          }
        }
      }
      return result;

    } else {
      const result: MenuCategory[] = new Array<MenuCategory>();

      const found_menu_categories: MenuCategory[] =
        await this.menu_category_repo.find({ where: { restaurant } });
      for (const loop_menu_category of found_menu_categories) {
        result.push(new MenuCategory(loop_menu_category));
      }
      return result;
    }
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
    const found_data = await getManager('mysql')
      .query(
        `SELECT * FROM ${config.MYSQL_SCHEMA}.menu AS m
            LEFT JOIN ${config.MYSQL_SCHEMA}.group AS g ON m.m_id = g.f_m_id
            LEFT JOIN ${config.MYSQL_SCHEMA}.option AS o ON g.g_id = o.f_g_id
            WHERE m.f_mc_id = ${menu_category.mc_id}`,
      );
    const options = {};
    for (const loop of found_data) {
      if (loop.o_id !== null) {
        if (options[loop.f_g_id] === undefined) {
          options[loop.g_id] = new Array<Option>();
        }
        options[loop.g_id].push(new Option(loop));
      }
    }
    const groups = {};

    let previous_id = null;
    for (const loop of found_data) {
      if (loop.g_id !== null && previous_id !== loop.g_id) {
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
    }

    previous_id = null;
    for (const loop of found_data) {
      if (loop.m_id !== null && previous_id !== loop.m_id) {
        previous_id = loop.m_id;
        const menu: Menu = new Menu(loop);
        result.push(menu);
        if (groups[loop.m_id] !== undefined) {
          for (const loop_group of groups[loop.m_id]) {
            menu.group.push(loop_group);
          }
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
      join: { alias: 'Group', leftJoinAndSelect: { Option: 'Group.option' } },
      where: { menu },
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
    return new Option(await this.option_repo.findOne({ group, o_name: name }));
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

  // coupon

  public async insert_coupon(coupon: Coupon): Promise<void> {
    await this.coupon_repo.insert(coupon);
  }

  public async find_coupon_by_restaurant(restaurant: Restaurant): Promise<Coupon> {
    const found_coupons: Coupon[] = await this.coupon_repo.find({ restaurant });
    for (const loop_coupon of found_coupons) {
      if (Date.now() < loop_coupon.c_expired_day.getTime()) {
        return new Coupon(loop_coupon);
      }
    }
    return new Coupon();
  }

  public async find_coupon_by_discount_amount(discount_amount: number): Promise<Coupon> {
    return new Coupon(await this.coupon_repo.findOne({ c_discount_amount: discount_amount }));
  }

  public async find_coupons_by_restaurant(restaurant: Restaurant): Promise<Coupon[]> {
    const found_coupons: Coupon[] = await this.coupon_repo.find({ restaurant });
    const result: Coupon[] = new Array<Coupon>();
    for (const loop_coupon of found_coupons) {
      result.push(new Coupon(loop_coupon));
    }
    return result;
  }

  public async delete_coupon(id: number): Promise<void> {
    await this.coupon_repo.delete(id);
  }

  // order

  public async insert_order(order: Order): Promise<void> {
    await this.order_repo.insertOne(order);
  }

  public async find_orders_by_user(user: User): Promise<Order[]> {
    const found_orders: Order[] = await this.order_repo.find({ f_u_id: user.u_id });
    const result: Order[] = new Array<Order>();
    for (const loop_order of found_orders) {
      result.push(new Order(loop_order));
    }
    return result;
  }

  public async find_orders_by_restaurant(restaurant: Restaurant): Promise<Order[]> {
    const found_orders: Order[] = await this.order_repo.find({ f_r_id: restaurant.r_id });
    const result: Order[] = new Array<Order>();
    for (const loop_order of found_orders) {
      result.push(new Order(loop_order));
    }
    return result;
  }

  public async find_order_by_payment_type(payment_type: EnumPaymentType): Promise<Order> {
    return new Order(await this.order_repo.findOne({ od_payment_type: payment_type }));
  }

  public async update_order(id: string, payload): Promise<void> {
    await this.order_repo.update(id, payload);
  }

  public async delete_order(id: ObjectID | ObjectID[]): Promise<void> {
    await this.order_repo.delete(id);
  }

}
