import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { Coupon, DBService, Restaurant } from '@app/db';
import { DtoUploadCoupon, QueryGetCoupon } from '@app/req';
import { ResGetCoupon, ResGetCouponList } from '@app/res';
import { UtilService } from '@app/util';

export class CouponService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  public async upload(token: string, payload: DtoUploadCoupon): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    const found_coupon: Coupon = await this.db_service.find_coupon_by_restaurant(found_restaurant);
    if (!found_coupon.is_empty()) {
      throw new ConflictException();
    }

    const coupon: Coupon = new Coupon(payload, found_restaurant);
    await this.db_service.insert_coupon(coupon);
  }

  public async get_list(token: string): Promise<ResGetCouponList[]> {
    const result: ResGetCouponList[] = new Array<ResGetCouponList>();
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    const found_coupons: Coupon[] = await this.db_service.find_coupons_by_restaurant(found_restaurant);
    if (found_coupons.length === 0) {
      throw new NotFoundException();
    }
    for (const loop_coupon of found_coupons) {
      result.push(new ResGetCouponList(loop_coupon));
    }
    return result;
  }

  public async get(param: string | QueryGetCoupon): Promise<ResGetCoupon> {
    let found_restaurant: Restaurant;
    if (typeof param === 'string') {
      const email: string = await this.util_service.get_email_by_token(param);
      found_restaurant = await this.db_service.find_restaurant_by_email(email);
    } else {
      found_restaurant = await this.db_service.find_restaurant_by_id(param.r_id);
    }
    const found_coupon: Coupon = await this.db_service.find_coupon_by_restaurant(found_restaurant);
    if (found_coupon.is_empty()) {
      throw new NotFoundException();
    }
    return new ResGetCoupon(found_coupon);
  }

  // only use in test

  public async get_coupon(discount_amount: number): Promise<Coupon> {
    return this.db_service.find_coupon_by_discount_amount(discount_amount);
  }

  public async remove(c_id: number): Promise<void> {
    await this.db_service.delete_coupon(c_id);
  }
}
