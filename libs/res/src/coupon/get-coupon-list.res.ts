import { IsBoolean, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Coupon } from '@app/db';

export class ResGetCouponList {
  @ApiProperty() @IsDate()
  public readonly expired_day: Date;
  @ApiProperty() @IsNumber()
  public readonly discount_amount: number;
  @ApiProperty() @IsBoolean()
  public readonly is_expired: boolean;

  constructor(coupon?) {
    if (coupon !== undefined) {
      if (coupon instanceof Coupon) {
        this.expired_day = coupon.c_expired_day;
        this.discount_amount = coupon.c_discount_amount;
        this.is_expired = Date.now() >= coupon.c_expired_day.getTime();
      }
    }
  }
}
