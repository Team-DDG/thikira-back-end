import { AuthService, EnumTokenType } from '@app/auth';
import { Coupon, Group, Menu, MenuCategory, Option, Restaurant } from '@app/entity';
import {
  DtoCheckPassword,
  DtoCreateRestaurant,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditRestaurantInfo,
  DtoSignIn,
  QueryCheckEmail,
  QueryGetRestaurantList,
  ResGetRestaurantList,
  ResLoadRestaurant,
  ResRefresh,
  ResSignIn,
} from '@app/type';
import { UtilService } from '@app/util';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class RestaurantService {
  @InjectRepository(Coupon, 'mysql')
  private readonly coupon_repo: Repository<Coupon>;
  @InjectRepository(Group, 'mysql')
  private readonly group_repo: Repository<Group>;
  @InjectRepository(Menu, 'mysql')
  private readonly menu_repo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly menu_category_repo: Repository<MenuCategory>;
  @InjectRepository(Option, 'mysql')
  private readonly option_repo: Repository<Option>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurant_repo: Repository<Restaurant>;
  @Inject()
  private readonly auth_service: AuthService;
  @Inject()
  private readonly util_service: UtilService;

  public async checkEmail(query: QueryCheckEmail): Promise<void> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne({ email: query.email });
    if (found_restaurant) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateRestaurant): Promise<void> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne({ name: payload.name });
    if (found_restaurant) {
      throw new ConflictException();
    }

    const restaurant: Restaurant = new Restaurant();
    Object.assign(restaurant, { ...payload, password: this.auth_service.encode(payload.password) });
    await this.restaurant_repo.insert(restaurant);
  }

  public async signIn(payload: DtoSignIn): Promise<ResSignIn> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne({ email: payload.email });
    if (!found_restaurant || found_restaurant.password !== this.auth_service.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      access_token: this.auth_service.createToken(found_restaurant.r_id, EnumTokenType.access),
      refresh_token: this.auth_service.createToken(found_restaurant.r_id, EnumTokenType.refresh),
    };
  }

  public refresh(id: number): ResRefresh {
    return { access_token: this.auth_service.createToken(id, EnumTokenType.access) };
  }

  public async checkPassword(id: number, payload: DtoCheckPassword): Promise<void> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);
    if (this.auth_service.encode(payload.password) !== found_restaurant.password) {
      throw new ForbiddenException();
    }
  }

  public async edit(id: number, payload: DtoEditRestaurantInfo | DtoEditAddress): Promise<void> {
    await this.restaurant_repo.update(id, payload);
  }

  public async editPassword(id: number, payload: DtoEditPassword): Promise<void> {
    await this.restaurant_repo.update(id, {
      password: this.auth_service.encode(payload.password),
    });
  }

  public async load(id: number): Promise<ResLoadRestaurant> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);
    ['password', 'r_id'].forEach((e: string) => Reflect.deleteProperty(found_restaurant, e));
    return found_restaurant;
  }

  public async getList(param: QueryGetRestaurantList): Promise<ResGetRestaurantList[]> {
    const found_restaurant: Restaurant[] = await this.restaurant_repo.find({ category: param.category });
    found_restaurant.forEach((e_restaurant: Restaurant) =>
      ['password'].forEach((e: string) => Reflect.deleteProperty(e_restaurant, e)));
    return found_restaurant;
  }

  public async leave(id: number): Promise<void> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);
    if (!found_restaurant) {
      throw new ForbiddenException();
    }

    const found_coupons: Coupon[] = await this.coupon_repo.find({ restaurant: found_restaurant });
    if (found_coupons) {
      await Promise.all(found_coupons.map(async (e_coupon: Coupon): Promise<DeleteResult> =>
        this.coupon_repo.delete(e_coupon.c_id)));
    }

    const found_menu_categories: MenuCategory[] = await this.menu_category_repo.find({
      join: {
        alias: 'MenuCategory',
        leftJoinAndSelect: {
          Menu: 'MenuCategory.menu',
          // eslint-disable-next-line sort-keys
          Group: 'Menu.group',
          Option: 'Group.option',
        },
      },
      where: { restaurant: found_restaurant },
    });

    const mc_ids: number[] = [];
    const m_ids: number[] = [];
    const g_ids: number[] = [];
    const o_ids: number[] = [];

    if (0 < found_menu_categories.length) {
      found_menu_categories.forEach((e_menu_category: MenuCategory) => {
        mc_ids.push(e_menu_category.mc_id);
        if (0 < e_menu_category.menu.length) {
          e_menu_category.menu.forEach((e_menu: Menu) => {
            m_ids.push(e_menu.m_id);
            if (0 < e_menu.group.length) {
              e_menu.group.forEach((e_group: Group) => {
                g_ids.push(e_group.g_id);
                if (0 < e_group.option.length) {
                  e_group.option.forEach((e_option: Option) => o_ids.push(e_option.o_id));
                }
              });
            }
          });
        }
      });
    }

    await Promise.all(o_ids.map(async (e_id: number): Promise<DeleteResult> =>
      this.option_repo.delete(e_id)));
    await Promise.all(g_ids.map(async (e_id: number): Promise<DeleteResult> =>
      this.group_repo.delete(e_id)));
    await Promise.all(m_ids.map(async (e_id: number): Promise<DeleteResult> =>
      this.menu_repo.delete(e_id)));
    await Promise.all(mc_ids.map(async (e_id: number): Promise<DeleteResult> =>
      this.menu_category_repo.delete(e_id)));

    await this.restaurant_repo.delete(id);
  }
}
