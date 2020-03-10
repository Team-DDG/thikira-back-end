import { ApiProperty } from '@nestjs/swagger';
import { Coupon } from '@app/db';

export class ResGetCoupon {
  @ApiProperty() public readonly discount_amount: number;
  @ApiProperty() public readonly expired_day: Date;

  constructor(coupon?) {
    if (coupon !== undefined) {
      if (coupon instanceof Coupon) {
        this.expired_day = coupon.c_expired_day;
        this.discount_amount = coupon.c_discount_amount;
      }
    }
  }
}
