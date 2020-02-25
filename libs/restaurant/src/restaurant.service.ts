import { DBService, Restaurant } from '@app/db';
import { ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/res';
import { TokenTypeEnum, UtilService } from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  DtoCheckPassword, DtoCreateRestaurant,
  DtoEditAddress, DtoEditPassword, DtoEditRestaurantInfo,
  DtoSignIn,
  QueryGetRestaurantList, QueryCheckEmail,
} from '@app/req';
import { ResGetRestaurantList } from '../../res/src/account/get-restaurant-list.res';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly db_service: DBService,
    private readonly util_service: UtilService,
  ) {
  }

  public async check_email(query: QueryCheckEmail): Promise<void> {
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(query.email);
    if (!found_restaurant.is_empty()) {
      throw new ConflictException();
    }
  }

  public async create_restaurant(payload: DtoCreateRestaurant): Promise<void> {
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
      r_image: payload.image, r_name: payload.name,
      r_phone: payload.phone, r_area: payload.area,
      r_min_price: payload.min_price,
      r_day_off: payload.day_off,
      r_online_payment: payload.online_payment,
      r_offline_payment: payload.offline_payment,
      r_open_time: payload.open_time,
      r_close_time: payload.close_time,
      r_description: payload.description,
    };
    for (const key of Object.keys(edit_data)) {
      if (edit_data[key] === undefined || edit_data[key] === null) {
        delete edit_data[key];
      }
    }
    await this.db_service.update_restaurant(email, edit_data);
  }

  public async edit_address(token: string, payload: DtoEditAddress) {
    const email: string = await this.util_service.get_email_by_token(token);
    await this.db_service.update_restaurant(email, {
      r_add_street: payload.add_street,
      r_add_parcel: payload.add_parcel,
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
