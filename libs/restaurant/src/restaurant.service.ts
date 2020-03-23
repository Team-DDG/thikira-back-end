import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, DBService, MenuCategory, Restaurant } from '@app/db';
import {
  DtoCheckPassword, DtoCreateRestaurant, DtoEditAddress, DtoEditPassword,
  DtoEditRestaurantInfo, DtoSignIn, QueryCheckEmail, QueryGetRestaurantList,
} from '@app/type/req';
import { ResGetRestaurantList, ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/type/res';
import { TokenTypeEnum, UtilService } from '@app/util';

@Injectable()
export class RestaurantService {
  @Inject()
  private readonly db_service: DBService;
  @Inject()
  private readonly util_service: UtilService;

  public async check_email(query: QueryCheckEmail): Promise<void> {
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(query.email);
    if (f_restaurant) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateRestaurant): Promise<void> {
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_name(payload.name);
    if (f_restaurant) {
      throw new ConflictException();
    }

    const restaurant: Restaurant = new Restaurant();
    Object.assign(restaurant, payload);
    await this.db_service.insert_restaurant(restaurant);
  }

  public async sign_in(payload: DtoSignIn): Promise<ResSignIn> {
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(payload.email);
    if (!f_restaurant || f_restaurant.password !== this.util_service.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      access_token: this.util_service.create_token(payload.email, TokenTypeEnum.access),
      refresh_token: this.util_service.create_token(payload.email, TokenTypeEnum.refresh),
    };
  }

  public refresh(token: string): ResRefresh {
    const email: string = this.util_service.get_email_by_token(token);
    return { access_token: this.util_service.create_token(email, TokenTypeEnum.access) };
  }

  public async check_password(token: string, payload: DtoCheckPassword): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    if (this.util_service.encode(payload.password) !== f_restaurant.password) {
      throw new ForbiddenException();
    }
  }

  public async edit(
    token: string,
    payload: DtoEditPassword | DtoEditRestaurantInfo | DtoEditAddress,
  ): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    await this.db_service.update_restaurant(email, payload);
  }

  public async load(token: string): Promise<ResLoadRestaurant> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    for (const e of ['coupon', 'email', 'password', 'r_id']) {
      Reflect.deleteProperty(f_restaurant, e);
    }
    return f_restaurant;
  }

  public async get_list(param: QueryGetRestaurantList): Promise<ResGetRestaurantList[]> {
    const f_restaurant: Restaurant[] = await this.db_service.find_restaurants_by_category(param.category);
    for (const e_r of f_restaurant) {
      for (const e of ['password']) {
        Reflect.deleteProperty(e_r, e);
      }
    }
    return f_restaurant;
  }

  public async leave(token: string): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    if (!f_restaurant) {
      throw new ForbiddenException();
    }

    const f_coupons: Coupon[] = await this.db_service.find_coupons_by_restaurant(f_restaurant);
    for (const e_c of f_coupons) {
      await this.db_service.delete_coupon(e_c.c_id);
    }

    const f_m_categories: MenuCategory[] =
      await this.db_service.find_menu_categories_by_restaurant(f_restaurant, true);
    if (0 < f_m_categories.length) {
      const mc_ids: number[] = [];
      for (const e_mc of f_m_categories) {
        mc_ids.push(e_mc.mc_id);
        if (0 < e_mc.menu.length) {
          const m_ids: number[] = [];
          for (const e_m of e_mc.menu) {
            m_ids.push(e_m.m_id);
            if (0 < e_m.group.length) {
              const g_ids: number[] = [];
              for (const e_g of e_m.group) {
                g_ids.push(e_g.g_id);
                if (0 < e_g.option.length) {
                  const o_ids: number[] = [];
                  for (const e_o of e_g.option) {
                    o_ids.push(e_o.o_id);
                  }
                  await this.db_service.delete_option(o_ids);
                }
              }
              await this.db_service.delete_group(g_ids);
            }
          }
          await this.db_service.delete_menu(m_ids);
        }
      }
      await this.db_service.delete_menu_category(mc_ids);
    }

    await this.db_service.delete_restaurant(email);
  }

  // use only in test

  public async get(token: string): Promise<Restaurant> {
    const email: string = this.util_service.get_email_by_token(token);
    return this.db_service.find_restaurant_by_email(email);
  }
}
