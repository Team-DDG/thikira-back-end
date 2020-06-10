import { AuthService } from '@app/auth';
import { Coupon, Restaurant } from '@app/entity';
import { DtoUploadCoupon, QueryGetCoupon, ResGetCoupon, ResGetCouponList } from '@app/type';
import { ConflictException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { MoreThan, Repository } from 'typeorm';

export class CouponService {
  @InjectRepository(Coupon, 'mysql')
  private readonly coupon_repo: Repository<Coupon>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurant_repo: Repository<Restaurant>;
  @Inject()
  private readonly auth_service: AuthService;

  public async upload(id: number, payload: DtoUploadCoupon): Promise<void> {
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);
    if (!found_restaurant) {
      throw new ForbiddenException();
    }
    const found_coupon: Coupon = await this.coupon_repo.findOne({
      expired_day: MoreThan(new Date()),
      restaurant: found_restaurant,
    });
    if (found_coupon) {
      throw new ConflictException();
    }

    const coupon: Coupon = new Coupon();
    Object.assign(coupon, { ...payload, restaurant: found_restaurant });
    await this.coupon_repo.insert(coupon);
  }

  public async getList(id: number): Promise<ResGetCouponList[]> {
    const res: ResGetCouponList[] = [];
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);
    const found_coupons: Coupon[] = await this.coupon_repo.find({ restaurant: found_restaurant });

    if (1 > found_coupons.length) {
      throw new NotFoundException();
    }

    for (const e_coupon of found_coupons) {
      res.push(plainToClass(ResGetCouponList, e_coupon));
    }
    return res;
  }

  public async get(param: number | QueryGetCoupon): Promise<ResGetCoupon> {
    let found_restaurant: Restaurant;
    if ('number' === typeof param) {
      found_restaurant = await this.restaurant_repo.findOne(param);
    } else {
      found_restaurant = await this.restaurant_repo.findOne(parseInt(param.r_id));
    }

    if (!found_restaurant) {
      throw new NotFoundException('not exist restaurant');
    }
    const found_coupon: Coupon = await this.coupon_repo.findOne({
      expired_day: MoreThan(new Date()), restaurant: found_restaurant,
    });
    if (!found_coupon) {
      throw new NotFoundException();
    }
    return plainToClass(ResGetCoupon, found_coupon);
  }

  // only use in test

  public async getCoupon(discount_amount: number): Promise<Coupon> {
    return this.coupon_repo.findOne({ discount_amount });
  }

  public async remove(c_id: number): Promise<void> {
    await this.coupon_repo.delete(c_id);
  }
}
