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
  private readonly couponRepo: Repository<Coupon>;
  @InjectRepository(Group, 'mysql')
  private readonly groupRepo: Repository<Group>;
  @InjectRepository(Menu, 'mysql')
  private readonly menuRepo: Repository<Menu>;
  @InjectRepository(MenuCategory, 'mysql')
  private readonly menuCategoryRepo: Repository<MenuCategory>;
  @InjectRepository(Option, 'mysql')
  private readonly optionRepo: Repository<Option>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurantRepo: Repository<Restaurant>;
  @Inject()
  private readonly tokenService: TokenService;
  @Inject()
  private readonly utilService: UtilService;

  public async checkEmail(query: QueryCheckEmail): Promise<void> {
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne({ email: query.email });
    if (foundRestaurant) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateRestaurant): Promise<void> {
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne({ name: payload.name });
    if (foundRestaurant) {
      throw new ConflictException();
    }

    const restaurant: Restaurant = new Restaurant();
    Object.assign(restaurant, { ...payload, password: this.utilService.encode(payload.password) });
    await this.restaurantRepo.insert(restaurant);
  }

  public async signIn(payload: DtoSignIn): Promise<ResSignIn> {
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne({ email: payload.email });
    if (!foundRestaurant || foundRestaurant.password !== this.utilService.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      accessToken: this.tokenService.createToken(foundRestaurant.restaurantId, TokenTypeEnum.access),
      refreshToken: this.tokenService.createToken(foundRestaurant.restaurantId, TokenTypeEnum.refresh),
    };
  }

  public refresh(token: string): ResRefresh {
    const restaurantId: number = this.tokenService.getIdByToken(token);
    return { accessToken: this.tokenService.createToken(restaurantId, TokenTypeEnum.access) };
  }

  public async checkPassword(token: string, payload: DtoCheckPassword): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    if (this.utilService.encode(payload.password) !== foundRestaurant.password) {
      throw new ForbiddenException();
    }
  }

  public async edit(token: string, payload: DtoEditRestaurantInfo | DtoEditAddress): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
    await this.restaurantRepo.update(id, payload);
  }

  public async editPassword(token: string, payload: DtoEditPassword): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
    await this.restaurantRepo.update(id, {
      password: this.utilService.encode(payload.password),
    });
  }

  public async load(token: string): Promise<ResLoadRestaurant> {
    const id: number = this.tokenService.getIdByToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    for (const element of ['coupon', 'password', 'restaurantId']) {
      Reflect.deleteProperty(foundRestaurant, element);
    }
    return foundRestaurant;
  }

  public async getList(param: QueryGetRestaurantList): Promise<ResGetRestaurantList[]> {
    const foundRestaurant: Restaurant[] = await this.restaurantRepo.find({ category: param.category });
    for (const elementRestaurant of foundRestaurant) {
      for (const element of ['password']) {
        Reflect.deleteProperty(elementRestaurant, element);
      }
    }
    return foundRestaurant;
  }

  public async leave(token: string): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    if (!foundRestaurant) {
      throw new ForbiddenException();
    }

    const foundCoupons: Coupon[] = await this.couponRepo.find({ restaurant: foundRestaurant });
    if (foundCoupons) {
      for (const elementCoupon of foundCoupons) {
        await this.couponRepo.delete(elementCoupon.couponId);
      }
    }

    const foundMenuCategoryList: MenuCategory[] = await this.menuCategoryRepo.find({
      join: {
        alias: 'MenuCategory',
        leftJoinAndSelect: {
          Menu: 'MenuCategory.menu',
          // eslint-disable-next-line sort-keys
          Group: 'Menu.group',
          Option: 'Group.option',
        },
      },
      where: { restaurant: foundRestaurant },
    });

    if (0 < foundMenuCategoryList.length) {
      const menuCategoryIds: number[] = [];
      for (const elementMenuCategory of foundMenuCategoryList) {
        menuCategoryIds.push(elementMenuCategory.menuCategoryId);
        if (0 < elementMenuCategory.menu.length) {
          const menuIds: number[] = [];
          for (const elementMenu of elementMenuCategory.menu) {
            menuIds.push(elementMenu.menuId);
            if (0 < elementMenu.group.length) {
              const groupIds: number[] = [];
              for (const elementGroup of elementMenu.group) {
                groupIds.push(elementGroup.groupId);
                if (0 < elementGroup.option.length) {
                  const optionIds: number[] = [];
                  for (const elementOption of elementGroup.option) {
                    optionIds.push(elementOption.optionId);
                  }
                  await this.optionRepo.delete(optionIds);
                }
              }
              await this.groupRepo.delete(groupIds);
            }
          }
          await this.menuRepo.delete(menuIds);
        }
      }
      await this.menuCategoryRepo.delete(menuCategoryIds);
    }

    await this.restaurantRepo.delete(id);
  }

  // use only in test

  public async get(token: string): Promise<Restaurant> {
    const id: number = this.tokenService.getIdByToken(token);
    return this.restaurantRepo.findOne(id);
  }
}
