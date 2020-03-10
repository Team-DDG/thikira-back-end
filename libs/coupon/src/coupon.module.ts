import { CouponService } from './coupon.service';
import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { TypeModule } from '@app/type';
import { UtilModule } from '@app/util';

@Module({
  exports: [CouponService],
  imports: [DBModule, TypeModule, UtilModule],
  providers: [CouponService],
})
export class CouponModule {

}
