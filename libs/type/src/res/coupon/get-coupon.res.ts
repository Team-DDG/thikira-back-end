import { ApiProperty } from '@nestjs/swagger';

export class ResGetCoupon {
  @ApiProperty() public readonly discount_amount: number;
  @ApiProperty() public readonly expired_day: Date;
}
