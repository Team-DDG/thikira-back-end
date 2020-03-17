import { ApiProperty } from '@nestjs/swagger';

export class ResGetCouponList {
  @ApiProperty() public readonly expired_day: Date;
  @ApiProperty() public readonly discount_amount: number;
  @ApiProperty() public readonly is_expired: boolean;
}
