import { ConflictException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Coupon, Restaurant } from '@app/db';
import { DtoUploadCoupon, QueryGetCoupon } from '@app/type/req';
import { ResGetCoupon, ResGetCouponList } from '@app/type/res';
import { DBService } from '@app/db';
import { UtilService } from '@app/util';
import { plainToClass } from 'class-transformer';

export class CouponService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  public async upload(token: string, payload: DtoUploadCoupon): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_r: Restaurant = await this.db_service.find_restaurant_by_email(email);
    const f_c: Coupon = await this.db_service.find_coupon_by_restaurant(f_r);
    if (!f_c) {
      throw new ConflictException();
    }

    const c: Coupon = new Coupon();
    Object.assign(c, { ...payload, r: f_r });
    await this.db_service.insert_coupon(c);
  }

  public async get_list(token: string): Promise<ResGetCouponList[]> {
    const res: ResGetCouponList[] = [];
    const email: string = this.util_service.get_email_by_token(token);
    const f_r: Restaurant = await this.db_service.find_restaurant_by_email(email);
    const f_c_list: Coupon[] = await this.db_service.find_coupons_by_restaurant(f_r);

    if (1 > f_c_list.length) {
      throw new NotFoundException();
    }

    for (const e_c of f_c_list) {
      res.push(plainToClass(ResGetCouponList, e_c));
    }
    return res;
  }

  public async get(param: string | QueryGetCoupon): Promise<ResGetCoupon> {
    let f_r: Restaurant;
    if ('string' === typeof param) {
      const email: string = this.util_service.get_email_by_token(param);
      f_r = await this.db_service.find_restaurant_by_email(email);
    } else {
      f_r = await this.db_service.find_restaurant_by_id(parseInt(param.r_id));
    }
    if (!f_r) {
      throw new ForbiddenException();
    }
    const f_c: Coupon = await this.db_service.find_coupon_by_restaurant(f_r);
    if (!f_c) {
      throw new NotFoundException();
    }
    return plainToClass(ResGetCoupon, f_c);
  }

  // only use in test

  public async get_coupon(discount_amount: number): Promise<Coupon> {
    return this.db_service.find_coupon_by_discount_amount(discount_amount);
  }

  public async remove(c_id: number): Promise<void> {
    await this.db_service.delete_coupon(c_id);
  }
}
