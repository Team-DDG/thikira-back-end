import { AuthService } from '@app/auth';
import { Coupon, Restaurant } from '@app/entity';
import { ParsedTokenClass } from '@app/type/etc';
import { DtoUploadCoupon, QueryGetCoupon } from '@app/type/req';
import { ResGetCoupon, ResGetCouponList } from '@app/type/res';
import { ConflictException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { MoreThan, Repository } from 'typeorm';

export class CouponService {
  @InjectRepository(Coupon, 'mysql')
  private readonly couponRepo: Repository<Coupon>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurantRepo: Repository<Restaurant>;
  @Inject()
  private readonly tokenService: AuthService;

  public async upload(token: string, payload: DtoUploadCoupon): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    if (!foundRestaurant) {
      throw new ForbiddenException();
    }
    const foundCoupon: Coupon = await this.couponRepo.findOne({
      expiredDay: MoreThan(Date.now()),
      restaurant: foundRestaurant,
    });
    if (foundCoupon) {
      throw new ConflictException();
    }

    const coupon: Coupon = new Coupon();
    Object.assign(coupon, { ...payload, restaurant: foundRestaurant });
    await this.couponRepo.insert(coupon);
  }

  public async getList(token: string): Promise<ResGetCouponList[]> {
    const res: ResGetCouponList[] = [];
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    const foundCoupons: Coupon[] = await this.couponRepo.find({ restaurant: foundRestaurant });

    if (1 > foundCoupons.length) {
      throw new NotFoundException();
    }

    for (const elementCoupon of foundCoupons) {
      res.push(plainToClass(ResGetCouponList, elementCoupon));
    }
    return res;
  }

  public async get(param: string | QueryGetCoupon): Promise<ResGetCoupon> {
    let foundRestaurant: Restaurant;
    if ('string' === typeof param) {
      const { id }: ParsedTokenClass = this.tokenService.parseToken(param);
      foundRestaurant = await this.restaurantRepo.findOne(id);
    } else {
      foundRestaurant = await this.restaurantRepo.findOne(parseInt(param.restaurantId));
    }

    if (!foundRestaurant) {
      throw new ForbiddenException();
    }
    const foundCoupon: Coupon = await this.couponRepo.findOne({ restaurant: foundRestaurant });
    if (!foundCoupon) {
      throw new NotFoundException();
    }
    return plainToClass(ResGetCoupon, foundCoupon);
  }

  // only use in test

  public async getCoupon(discountAmount: number): Promise<Coupon> {
    return this.couponRepo.findOne({ discountAmount });
  }

  public async remove(couponId: number): Promise<void> {
    await this.couponRepo.delete(couponId);
  }
}
