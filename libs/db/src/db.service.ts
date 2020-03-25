import {
  Coupon, Group, Menu, MenuCategory,
  Option, Order, ReplyReview,
  Restaurant, Review, User,
} from './entity';
import {
  EditGroupClass, EditMenuCategoryClass, EditMenuClass,
  EditOptionClass, EditOrderClass, EditReplyReviewClass,
  EditRestaurantClass, EditReviewClass, EditUserClass,
} from '@app/type/etc';
import { Inject, Injectable } from '@nestjs/common';
import { MongoRepository, ObjectID, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UtilService } from '@app/util';

@Injectable()
export class DBService {
  @InjectRepository(Coupon, 'mysql')
  private readonly c_repo: Repository<Coupon>;
  @InjectRepository(Group, 'mysql')
  private readonly g_repo: Repository<Group>;
  @InjectRepository(Menu, 'mysql')
  private readonly m_repo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly mc_repo: Repository<MenuCategory>;
  @InjectRepository(Order, 'mongodb')
  private readonly od_repo: MongoRepository<Order>;
  @InjectRepository(Option, 'mysql')
  private readonly o_repo: Repository<Option>;
  @InjectRepository(ReplyReview, 'mysql')
  private readonly rr_repo: Repository<ReplyReview>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly r_repo: Repository<Restaurant>;
  @InjectRepository(Review, 'mysql')
  private readonly rv_repo: Repository<Review>;
  @InjectRepository(User, 'mysql')
  private readonly u_repo: Repository<User>;
  @Inject()
  private readonly util_service: UtilService;

  //restaurant

  public async insert_restaurant(restaurant: Restaurant): Promise<void> {
    await this.r_repo.insert({ ...restaurant, password: this.util_service.encode(restaurant.password) });
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

  public async update_restaurant(email: string, payload: EditRestaurantClass): Promise<void> {
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

  public async find_user_by_email(email: string): Promise<User> {
    return this.u_repo.findOne({ email });
  }

  public async find_user_by_nickname(nickname: string): Promise<User> {
    return this.u_repo.findOne({ nickname });
  }

  public async update_user(email: string, payload: EditUserClass): Promise<void> {
    if (payload.password) {
      payload = { ...payload, password: this.util_service.encode(payload.password) };
    }
    await this.u_repo.update({ email }, payload);
  }

  public async delete_user(email: string): Promise<void> {
    await this.u_repo.delete({ email });
  }

  public async insert_menu_category(menu_category: MenuCategory): Promise<void> {
    await this.mc_repo.insert(menu_category);
  }

  public async find_menu_category_by_id(id: number): Promise<MenuCategory> {
    return this.mc_repo.findOne(id);
  }

  public async find_menu_category_by_name(name: string, restaurant: Restaurant): Promise<MenuCategory> {
    return this.mc_repo.findOne({ name, restaurant: restaurant });
  }

  public async find_menu_categories_by_restaurant(
    restaurant: Restaurant, are_with_menu: boolean,
  ): Promise<MenuCategory[]> {
    if (are_with_menu) {
      return this.mc_repo.createQueryBuilder()
        .where(`MenuCategory.r_id = ${restaurant.r_id.toString()}`)
        .leftJoinAndSelect('MenuCategory.menu', 'Menu')
        .leftJoinAndSelect('Menu.group', 'Group')
        .leftJoinAndSelect('Group.option', 'Option')
        .getMany();
    } else {
      return this.mc_repo.find({ restaurant: restaurant });
    }
  }

  public async update_menu_category(id: number, payload: EditMenuCategoryClass): Promise<void> {
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

  public async find_menu_by_name(name: string, menu_category: MenuCategory): Promise<Menu> {
    return this.m_repo.findOne({ menu_category: menu_category, name });
  }

  public async find_menus_by_menu_category(menu_category: MenuCategory): Promise<Menu[]> {
    return this.m_repo.createQueryBuilder()
      .where(`Menu.mc_id = ${menu_category.mc_id.toString()}`)
      .leftJoinAndSelect('Menu.group', 'Group')
      .leftJoinAndSelect('Group.option', 'Option')
      .getMany();
  }

  public async update_menu(id: number, payload: EditMenuClass): Promise<void> {
    await this.m_repo.update(id, payload);
  }

  public async delete_menu(id: number[]): Promise<void> {
    await this.m_repo.delete(id);
  }

  // group

  public async insert_group(group: Group): Promise<void> {
    await this.g_repo.insert(group);
  }

  public async find_group_by_id(id: number): Promise<Group> {
    return this.g_repo.findOne(id);
  }

  public async find_group_by_name(name: string, menu: Menu): Promise<Group> {
    return this.g_repo.findOne({ menu: menu, name });
  }

  public async find_groups_by_menu(menu: Menu): Promise<Group[]> {
    return this.g_repo.find({
      join: { alias: 'Group', leftJoinAndSelect: { Option: 'Group.option' } },
      where: { menu },
    });
  }

  public async update_group(id: number, payload: EditGroupClass): Promise<void> {
    await this.g_repo.update(id, payload);
  }

  public async delete_group(id: number[]): Promise<void> {
    await this.g_repo.delete(id);
  }

  // option

  public async insert_option(option: Option): Promise<void> {
    await this.o_repo.insert(option);
  }

  public async find_option_by_id(id: number): Promise<Option> {
    return this.o_repo.findOne(id);
  }

  public async find_option_by_name(name: string, group: Group): Promise<Option> {
    return this.o_repo.findOne({ group: group, name });
  }

  public async find_options_by_group(group: Group): Promise<Option[]> {
    return this.o_repo.find({ where: { group } });
  }

  public async update_option(id: number, payload: EditOptionClass): Promise<void> {
    await this.o_repo.update(id, payload);
  }

  public async delete_option(id: number[]): Promise<void> {
    await this.o_repo.delete(id);
  }

  // coupon

  public async insert_coupon(coupon: Coupon): Promise<void> {
    await this.c_repo.insert(coupon);
  }

  public async find_coupon_by_restaurant(restaurant: Restaurant): Promise<Coupon> {
    const f_coupons: Coupon[] = await this.c_repo.find({ restaurant: restaurant });
    for (const e_c of f_coupons) {
      if (Date.now() < e_c.expired_day.getTime()) {
        return e_c;
      }
    }
    return new Coupon();
  }

  public async find_coupon_by_discount_amount(discount_amount: number): Promise<Coupon> {
    return this.c_repo.findOne({ discount_amount });
  }

  public async find_coupons_by_restaurant(restaurant: Restaurant): Promise<Coupon[]> {
    return this.c_repo.find({ restaurant });
  }

  public async delete_coupon(id: number): Promise<void> {
    await this.c_repo.delete(id);
  }

  // order

  public async insert_order(option: Order): Promise<void> {
    await this.od_repo.insertOne(option);
  }

  public async find_orders_by_user(user: User): Promise<Order[]> {
    const res: Order[] = [];
    const f_orders: Order[] = await this.od_repo.find({ u_id: user.u_id });
    if (0 < f_orders.length) {
      for (const e_od of f_orders) {
        res.push(new Order(e_od));
      }
      return res;
    }
    return null;
  }

  public async find_orders_by_restaurant(restaurant: Restaurant): Promise<Order[]> {
    const res: Order[] = [];
    const f_orders: Order[] = await this.od_repo.find({ r_id: restaurant.r_id });
    if (f_orders) {
      for (const e_od of f_orders) {
        res.push(new Order(e_od));
      }
      return res;
    }
    return null;
  }

  public async find_orders_by_restaurant_user(restaurant: Restaurant, user: User): Promise<Order[]> {
    const res: Order[] = [];
    const f_orders: Order[] = await this.od_repo.find({ r_id: restaurant.r_id, u_id: user.u_id });
    if (f_orders) {
      for (const e_od of f_orders) {
        res.push(new Order(e_od));
      }
      return res;
    }
    return null;
  }

  public async find_order_by_id(id: ObjectID | string): Promise<Order> {
    return new Order(await this.od_repo.findOne(id));
  }

  public async update_order(id: string, payload: EditOrderClass): Promise<void> {
    await this.od_repo.update(id, payload);
  }

  public async delete_order(id: ObjectID | ObjectID[] | string): Promise<void> {
    await this.od_repo.delete(id);
  }

  // review

  public async insert_review(review: Review): Promise<void> {
    await this.rv_repo.insert(review);
  }

  public async find_review_by_id(id: number): Promise<Review> {
    return this.rv_repo.findOne(id, {
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
    });
  }

  public async find_review_by_email(email: string): Promise<Review> {
    return this.rv_repo.createQueryBuilder()
      .where(`User.email = "${email}"`)
      .leftJoinAndSelect('Review.user', 'User')
      .leftJoinAndSelect('Review.reply_review', 'ReplyReview')
      .getOne();
  }

  public async find_review_by_restaurant_user(restaurant: Restaurant, user: User): Promise<Review> {
    return this.rv_repo.findOne({ restaurant, user });
  }

  public async find_reviews_by_restaurant(restaurant: Restaurant): Promise<Review[]> {
    return this.rv_repo.find({
      join: { alias: 'Review', leftJoinAndSelect: { ReplyReview: 'Review.reply_review' } },
      where: { restaurant },
    });
  }

  public async find_reviews_by_user(user: User): Promise<Review[]> {
    return this.rv_repo.find({
      join: { alias: 'Review', leftJoinAndSelect: { ReplyReview: 'Review.reply_review' } },
      where: { user },
    });
  }

  public async update_review(id: number, payload: EditReviewClass): Promise<void> {
    await this.rv_repo.update(id, payload);
  }

  public async delete_review(id: number): Promise<void> {
    await this.rv_repo.delete(id);
  }

  // reply_review

  public async find_reply_review_by_email(email: string): Promise<ReplyReview> {
    return this.rr_repo.createQueryBuilder()
      .where(`Restaurant.email= "${email}"`)
      .leftJoinAndSelect('ReplyReview.restaurant', 'Restaurant')
      .getOne();
  }

  public async insert_reply_review(reply_review: ReplyReview): Promise<void> {
    await this.rr_repo.insert(reply_review);
  }

  public async update_reply_review(id: number, payload: EditReplyReviewClass): Promise<void> {
    await this.rr_repo.update(id, payload);
  }

  public async delete_reply_review(id: number): Promise<void> {
    await this.rr_repo.delete(id);
  }
}
