import { CouponService } from './coupon.service';
import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { UtilModule } from '@app/util';

@Module({
  exports: [CouponService],
  imports: [DBModule, UtilModule],
  providers: [CouponService],
})
export class CouponModule {

}
