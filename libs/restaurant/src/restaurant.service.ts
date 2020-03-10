import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Coupon, DBService, MenuCategory, Restaurant } from '@app/db';
import {
  DtoCheckPassword, DtoCreateRestaurant,
  DtoEditAddress, DtoEditPassword, DtoEditRestaurantInfo,
  DtoSignIn,
  QueryCheckEmail, QueryGetRestaurantList,
} from '@app/type/req';
import { ResGetRestaurantList, ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/type/res';
import { TokenTypeEnum, UtilService } from '@app/util';

@Injectable()
export class RestaurantService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  public async check_email(query: QueryCheckEmail): Promise<void> {
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(query.email);
    if (!found_restaurant.is_empty()) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateRestaurant): Promise<void> {
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_name(payload.name);
    if (!found_restaurant.is_empty()) {
      throw new ConflictException();
    }

    await this.db_service.insert_restaurant(new Restaurant({
      ...payload, password: await this.util_service.encode(payload.password),
    }));
  }

  public async sign_in(payload: DtoSignIn): Promise<ResSignIn> {
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(payload.email);
    if (found_restaurant.is_empty() ||
      found_restaurant.r_password !== await this.util_service.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      access_token: await this.util_service.create_token(payload.email, TokenTypeEnum.access),
      refresh_token: await this.util_service.create_token(payload.email, TokenTypeEnum.refresh),
    };
  }

  public async refresh(token: string): Promise<ResRefresh> {
    const email: string = await this.util_service.get_email_by_token(token);
    return { access_token: await this.util_service.create_token(email, TokenTypeEnum.access) };
  }

  public async leave(token: string): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);

    const found_coupons: Coupon[] = await this.db_service.find_coupons_by_restaurant(found_restaurant);
    for (const loop_coupon of found_coupons) {
      await this.db_service.delete_coupon(loop_coupon.c_id);
    }

    const found_menu_categories: MenuCategory[] =
      await this.db_service.find_menu_categories_by_restaurant(found_restaurant, true);
    if (found_menu_categories.length > 0) {
      const mc_ids: number[] = new Array<number>();
      for (const loop_menu_category of found_menu_categories) {
        mc_ids.push(loop_menu_category.mc_id);
        if (loop_menu_category.menu.length > 0) {
          const m_ids: number[] = new Array<number>();
          for (const loop_menu of loop_menu_category.menu) {
            m_ids.push(loop_menu.m_id);
            if (loop_menu.group.length > 0) {
              const g_ids: number[] = new Array<number>();
              for (const loop_group of loop_menu.group) {
                g_ids.push(loop_group.g_id);
                if (loop_group.option.length > 0) {
                  const o_ids: number[] = new Array<number>();
                  for (const loop_option of loop_group.option) {
                    o_ids.push(loop_option.o_id);
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

  public async check_password(token: string, payload: DtoCheckPassword): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    if (await this.util_service.encode(payload.password) !== found_restaurant.r_password) {
      throw new UnauthorizedException();
    }
  }

  public async edit_password(token: string, payload: DtoEditPassword) {
    const email: string = await this.util_service.get_email_by_token(token);
    await this.db_service.update_restaurant(email, { r_password: payload.password });
  }

  public async edit_info(token: string, payload: DtoEditRestaurantInfo) {
    const email: string = await this.util_service.get_email_by_token(token);
    const edit_data = {
      r_area: payload.area,
      r_close_time: payload.close_time,
      r_day_off: payload.day_off,
      r_description: payload.description,
      r_image: payload.image,
      r_min_price: payload.min_price,
      r_name: payload.name,
      r_offline_payment: payload.offline_payment,
      r_online_payment: payload.online_payment,
      r_open_time: payload.open_time,
      r_phone: payload.phone,
    };
    for (const loop_key of Object.keys(edit_data)) {
      if (edit_data[loop_key] === undefined || edit_data[loop_key] === null) {
        delete edit_data[loop_key];
      }
    }
    await this.db_service.update_restaurant(email, edit_data);
  }

  public async edit_address(token: string, payload: DtoEditAddress) {
    const email: string = await this.util_service.get_email_by_token(token);
    await this.db_service.update_restaurant(email, {
      r_add_parcel: payload.add_parcel,
      r_add_street: payload.add_street,
    });
  }

  public async get(token: string): Promise<ResLoadRestaurant> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    return new ResLoadRestaurant(found_restaurant);
  }

  public async get_list(param: QueryGetRestaurantList): Promise<ResGetRestaurantList[]> {
    const found_restaurant: Restaurant[] = await this.db_service.find_restaurants_by_category(param.category);
    const result: ResGetRestaurantList[] = new Array<ResGetRestaurantList>();
    for (const loop_restaurant of found_restaurant) {
      result.push(new ResGetRestaurantList(loop_restaurant));
    }
    return result;
  }
}
