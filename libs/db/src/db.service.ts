import { Coupon, Group, Menu, MenuCategory, Option, Order, Restaurant, User } from './entity';
import { Inject, Injectable } from '@nestjs/common';
import { MongoRepository, ObjectID, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UtilService } from '@app/util';

@Injectable()
export class DBService {
  @InjectRepository(Restaurant, 'mysql')
  private readonly r_repo: Repository<Restaurant>;
  @InjectRepository(User, 'mysql')
  private readonly u_repo: Repository<User>;
  @InjectRepository(Menu, 'mysql')
  private readonly m_repo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly mc_repo: Repository<MenuCategory>;
  @InjectRepository(Option, 'mysql')
  private readonly o_repo: Repository<Option>;
  @InjectRepository(Group, 'mysql')
  private readonly g_repo: Repository<Group>;
  @InjectRepository(Coupon, 'mysql')
  private readonly c_repo: Repository<Coupon>;
  @InjectRepository(Order, 'mongodb')
  private readonly od_repo: MongoRepository<Order>;
  @Inject()
  private readonly util_service: UtilService;

  //r

  public async insert_restaurant(r: Restaurant): Promise<void> {
    await this.r_repo.insert({ ...r, password: this.util_service.encode(r.password) });
  }

  public async find_restaurant_by_id(id: number): Promise<Restaurant> {
    return this.r_repo.findOne(id);
  }

  public async find_restaurant_by_email(email: string): Promise<Restaurant> {
    return this.r_repo.findOne({ email });
  }

  public async find_restaurant_by_name(name: string): Promise<Restaurant> {
    return this.r_repo.findOne({ name });
  }

  public async find_restaurants_by_category(category: string): Promise<Restaurant[]> {
    return this.r_repo.find({ category });
  }

  public async update_restaurant(email: string, payload): Promise<void> {
    if (payload.password) {
      payload = { ...payload, password: this.util_service.encode(payload.password) };
    }
    await this.r_repo.update({ email }, payload);
  }

  public async delete_restaurant(email: string): Promise<void> {
    await this.r_repo.delete({ email });
  }

  // user

  public async insert_user(user: User): Promise<void> {
    await this.u_repo.insert({ ...user, password: this.util_service.encode(user.password) });
  }

  public async find_user_by_nickname(nickname: string): Promise<User> {
    return this.u_repo.findOne({ nickname });
  }

  public async find_user_by_email(email: string): Promise<User> {
    return this.u_repo.findOne({ email });
  }

  public async update_user(email: string, payload): Promise<void> {
    if (payload.password) {
      payload = { ...payload, password: this.util_service.encode(payload.password) };
    }
    await this.u_repo.update({ email }, payload);
  }

  public async delete_user(email: string): Promise<void> {
    await this.u_repo.delete({ email });
  }

  public async insert_menu_category(mc: MenuCategory): Promise<void> {
    await this.mc_repo.insert(mc);
  }

  public async find_menu_category_by_id(id: number): Promise<MenuCategory> {
    return this.mc_repo.findOne(id);
  }

  public async find_menu_category_by_name(name: string, r: Restaurant): Promise<MenuCategory> {
    return this.mc_repo.findOne({ name, r });
  }

  public async find_menu_categories_by_restaurant(r: Restaurant, are_with_menu: boolean): Promise<MenuCategory[]> {
    if (are_with_menu) {
      return this.mc_repo.createQueryBuilder()
        .where(`MenuCategory.r_id = ${r.r_id.toString()}`)
        .leftJoinAndSelect('MenuCategory.m', 'Menu')
        .leftJoinAndSelect('Menu.g', 'Group')
        .leftJoinAndSelect('Group.o', 'Option')
        .getMany();
    } else {
      return this.mc_repo.find({ r });
    }
  }

  public async update_menu_category(id: number, payload): Promise<void> {
    await this.mc_repo.update(id, payload);
  }

  public async delete_menu_category(id: number[]): Promise<void> {
    await this.mc_repo.delete(id);
  }

  // menu

  public async insert_menu(menu: Menu): Promise<void> {
    await this.m_repo.insert(menu);
  }

  public async find_menu_by_id(id: number): Promise<Menu> {
    return this.m_repo.findOne(id);
  }

  public async find_menu_by_name(name: string, mc: MenuCategory): Promise<Menu> {
    return this.m_repo.findOne({ mc, name });
  }

  public async find_menus_by_menu_category(mc: MenuCategory): Promise<Menu[]> {
    return this.m_repo.createQueryBuilder()
      .where(`Menu.mc_id = ${mc.mc_id.toString()}`)
      .leftJoinAndSelect('Menu.g', 'Group')
      .leftJoinAndSelect('Group.o', 'Option')
      .getMany();
  }

  public async update_menu(id: number, payload): Promise<void> {
    await this.m_repo.update(id, payload);
  }

  public async delete_menu(id: number[]): Promise<void> {
    await this.m_repo.delete(id);
  }

  // group

  public async insert_group(g: Group): Promise<void> {
    await this.g_repo.insert(g);
  }

  public async find_group_by_id(id: number): Promise<Group> {
    return this.g_repo.findOne(id);
  }

  public async find_group_by_name(name: string, m: Menu): Promise<Group> {
    return this.g_repo.findOne({ m, name });
  }

  public async find_groups_by_menu(m: Menu): Promise<Group[]> {
    return this.g_repo.find({
      join: { alias: 'Group', leftJoinAndSelect: { Option: 'Group.o' } },
      where: { m },
    });
  }

  public async update_group(id: number, payload): Promise<void> {
    await this.g_repo.update(id, payload);
  }

  public async delete_group(id: number[]): Promise<void> {
    await this.g_repo.delete(id);
  }

  // option

  public async insert_option(o: Option): Promise<void> {
    await this.o_repo.insert(o);
  }

  public async find_option_by_id(id: number): Promise<Option> {
    return this.o_repo.findOne(id);
  }

  public async find_option_by_name(name: string, group: Group): Promise<Option> {
    return this.o_repo.findOne({ g: group, name });
  }

  public async find_options_by_group(g: Group): Promise<Option[]> {
    return this.o_repo.find({ where: { g: g } });
  }

  public async update_option(id: number, payload): Promise<void> {
    await this.o_repo.update(id, payload);
  }

  public async delete_option(id: number[]): Promise<void> {
    await this.o_repo.delete(id);
  }

  // coupon

  public async insert_coupon(c: Coupon): Promise<void> {
    await this.c_repo.insert(c);
  }

  public async find_coupon_by_restaurant(r: Restaurant): Promise<Coupon> {
    const f_c_list: Coupon[] = await this.c_repo.find({ r });
    for (const e_c of f_c_list) {
      if (Date.now() < e_c.expired_day.getTime()) {
        return e_c;
      }
    }
    return new Coupon();
  }

  public async find_coupon_by_discount_amount(discount_amount: number): Promise<Coupon> {
    return this.c_repo.findOne({ discount_amount });
  }

  public async find_coupons_by_restaurant(r: Restaurant): Promise<Coupon[]> {
    return this.c_repo.find({ r });
  }

  public async delete_coupon(id: number): Promise<void> {
    await this.c_repo.delete(id);
  }

  // order

  public async insert_order(o: Order): Promise<void> {
    await this.od_repo.insertOne(o);
  }

  public async find_orders_by_user(u: User): Promise<Order[]> {
    const res: Order[] = [];
    const f_od_list: Order[] = await this.od_repo.find({ u_id: u.u_id });
    if (0 === f_od_list.length) {
      for (const e_od of f_od_list) {
        res.push(new Order(e_od));
      }
      return res;
    }
    return null;
  }

  public async find_orders_by_restaurant(r: Restaurant): Promise<Order[]> {
    const res: Order[] = [];
    const f_od_list: Order[] = await this.od_repo.find({ r_id: r.r_id });
    if (0 === f_od_list.length) {
      for (const e_od of f_od_list) {
        res.push(new Order(e_od));
      }
      return res;
    }
    return null;
  }

  public async find_order_by_restaurant_id(id: number): Promise<Order> {
    return new Order(await this.od_repo.findOne({ r_id: id }));
  }

  public async update_order(id: string, payload): Promise<void> {
    await this.od_repo.update(id, payload);
  }

  public async delete_order(id: ObjectID | ObjectID[]): Promise<void> {
    await this.od_repo.delete(id);
  }
}
