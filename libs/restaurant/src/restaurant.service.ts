import { Coupon, Group, Menu, MenuCategory, Option, Restaurant } from '@app/entity';
import { TokenService, TokenTypeEnum } from '@app/token';
import {
  DtoCheckPassword,
  DtoCreateRestaurant,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditRestaurantInfo,
  DtoSignIn,
  QueryCheckEmail,
  QueryGetRestaurantList,
} from '@app/type/req';
import { ResGetRestaurantList, ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/type/res';
import { UtilService } from '@app/util';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantService {
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
  private readonly token_service: TokenService;
  @Inject()
  private readonly util_service: UtilService;

  public async check_email(query: QueryCheckEmail): Promise<void> {
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email: query.email });
    if (f_restaurant) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateRestaurant): Promise<void> {
    const f_restaurant: Restaurant = await this.r_repo.findOne({ name: payload.name });
    if (f_restaurant) {
      throw new ConflictException();
    }

    const restaurant: Restaurant = new Restaurant();
    Object.assign(restaurant, { ...payload, password: this.util_service.encode(payload.password) });
    await this.r_repo.insert(restaurant);
  }

  public async sign_in(payload: DtoSignIn): Promise<ResSignIn> {
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email: payload.email });
    if (!f_restaurant || f_restaurant.password !== this.util_service.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      access_token: this.token_service.create_token(f_restaurant.r_id, TokenTypeEnum.access),
      refresh_token: this.token_service.create_token(f_restaurant.r_id, TokenTypeEnum.refresh),
    };
  }

  public refresh(token: string): ResRefresh {
    const r_id: number = this.token_service.get_id_by_token(token);
    return { access_token: this.token_service.create_token(r_id, TokenTypeEnum.access) };
  }

  public async check_password(token: string, payload: DtoCheckPassword): Promise<void> {
    const id: number = this.token_service.get_id_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne(id);
    if (this.util_service.encode(payload.password) !== f_restaurant.password) {
      throw new ForbiddenException();
    }
  }

  public async edit(token: string, payload: DtoEditRestaurantInfo | DtoEditAddress): Promise<void> {
    const id: number = this.token_service.get_id_by_token(token);
    await this.r_repo.update(id, payload);
  }

  public async edit_password(token: string, payload: DtoEditPassword): Promise<void> {
    const id: number = this.token_service.get_id_by_token(token);
    await this.r_repo.update(id, {
      password: this.util_service.encode(payload.password),
    });
  }

  public async load(token: string): Promise<ResLoadRestaurant> {
    const id: number = this.token_service.get_id_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne(id);
    for (const e of ['coupon', 'password', 'r_id']) {
      Reflect.deleteProperty(f_restaurant, e);
    }
    return f_restaurant;
  }

  public async get_list(param: QueryGetRestaurantList): Promise<ResGetRestaurantList[]> {
    const f_restaurant: Restaurant[] = await this.r_repo.find({ category: param.category });
    for (const e_r of f_restaurant) {
      for (const e of ['password']) {
        Reflect.deleteProperty(e_r, e);
      }
    }
    return f_restaurant;
  }

  public async leave(token: string): Promise<void> {
    const id: number = this.token_service.get_id_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne(id);
    if (!f_restaurant) {
      throw new ForbiddenException();
    }

    const f_coupons: Coupon[] = await this.c_repo.find({ restaurant: f_restaurant });
    if (f_coupons) {
      for (const e_c of f_coupons) {
        await this.c_repo.delete(e_c.c_id);
      }
    }

    const f_m_categories: MenuCategory[] = await this.mc_repo.find({
      join: {
        alias: 'MenuCategory',
        leftJoinAndSelect: {
          Menu: 'MenuCategory.menu',
          // eslint-disable-next-line sort-keys
          Group: 'Menu.group',
          Option: 'Group.option',
        },
      },
      where: { restaurant: f_restaurant },
    });

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
                  await this.o_repo.delete(o_ids);
                }
              }
              await this.g_repo.delete(g_ids);
            }
          }
          await this.m_repo.delete(m_ids);
        }
      }
      await this.mc_repo.delete(mc_ids);
    }

    await this.r_repo.delete(id);
  }

  // use only in test

  public async get(token: string): Promise<Restaurant> {
    const id: number = this.token_service.get_id_by_token(token);
    return this.r_repo.findOne(id);
  }
}
