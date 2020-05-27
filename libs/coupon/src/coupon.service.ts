import { ConflictException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Coupon, Restaurant } from '@app/entity';
import { DtoUploadCoupon, QueryGetCoupon } from '@app/type/req';
import { MoreThan, Repository } from 'typeorm';
import { ResGetCoupon, ResGetCouponList } from '@app/type/res';
import { InjectRepository } from '@nestjs/typeorm';
import { UtilService } from '@app/util';
import { plainToClass } from 'class-transformer';

export class CouponService {
  @InjectRepository(Coupon, 'mysql')
  private readonly c_repo: Repository<Coupon>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly r_repo: Repository<Restaurant>;
  @Inject()
  private readonly util_service: UtilService;

  public async upload(token: string, payload: DtoUploadCoupon): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email });
    if (!f_restaurant) {
      throw new ForbiddenException();
    }
    const f_coupon: Coupon = await this.c_repo.findOne({
      expired_day: MoreThan(Date.now()),
      restaurant: f_restaurant,
    });
    if (f_coupon) {
      throw new ConflictException();
    }

    const coupon: Coupon = new Coupon();
    Object.assign(coupon, { ...payload, restaurant: f_restaurant });
    await this.c_repo.insert(coupon);
  }

  public async get_list(token: string): Promise<ResGetCouponList[]> {
    const res: ResGetCouponList[] = [];
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email });
    const f_coupons: Coupon[] = await this.c_repo.find({ restaurant: f_restaurant });

    if (1 > f_coupons.length) {
      throw new NotFoundException();
    }

    for (const e_c of f_coupons) {
      res.push(plainToClass(ResGetCouponList, e_c));
    }
    return res;
  }

  public async get(param: string | QueryGetCoupon): Promise<ResGetCoupon> {
    let f_restaurant: Restaurant;
    if ('string' === typeof param) {
      const email: string = this.util_service.get_email_by_token(param);
      f_restaurant = await this.r_repo.findOne({ email });
    } else {
      f_restaurant = await this.r_repo.findOne(parseInt(param.r_id));
    }

    if (!f_restaurant) {
      throw new ForbiddenException();
    }
    const f_coupon: Coupon = await this.c_repo.findOne({ restaurant: f_restaurant });
    if (!f_coupon) {
      throw new NotFoundException();
    }
    return plainToClass(ResGetCoupon, f_coupon);
  }

  // only use in test

  public async get_coupon(discount_amount: number): Promise<Coupon> {
    return this.c_repo.findOne({ discount_amount });
  }

  public async remove(c_id: number): Promise<void> {
    await this.c_repo.delete(c_id);
  }
}
