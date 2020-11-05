import { AuthService } from '@app/auth';
import { Coupon, Restaurant } from '@app/entity';
import { DtoUploadCoupon, QueryGetCoupon, ResGetCoupon, ResGetCouponList } from '@app/type';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
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
    const found_coupon: Coupon = await this.coupon_repo.findOne({
      expired_day: MoreThan(new Date()),
      restaurant: { r_id: id },
    });
    if (found_coupon) {
      throw new ConflictException();
    }

    const coupon: Coupon = new Coupon();
    Object.assign(coupon, { ...payload, restaurant: { r_id: id } });
    await this.coupon_repo.insert(coupon);
  }

  public async getList(id: number): Promise<ResGetCouponList[]> {
    const found_coupons: Coupon[] = await this.coupon_repo.find({ restaurant: { r_id: id } });

    if (1 > found_coupons.length) {
      throw new NotFoundException();
    }

    return found_coupons.map((e_coupon: Coupon): ResGetCouponList => {
      ['c_id'].forEach((e: string) => Reflect.deleteProperty(e_coupon, e));
      return { ...e_coupon, is_expired: Date.now() < e_coupon.expired_day.valueOf() };
    });
  }

  public async get(param: number | QueryGetCoupon): Promise<ResGetCoupon> {
    const r_id: number = 'number' === typeof param ? param : parseInt(param.r_id);

    const num_of_restaurant: number = await this.restaurant_repo.count({ r_id });

    if (1 < num_of_restaurant) {
      throw new NotFoundException('not exist restaurant');
    }
    const found_coupon: Coupon = await this.coupon_repo.findOne({
      expired_day: MoreThan(new Date()), restaurant: { r_id },
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
