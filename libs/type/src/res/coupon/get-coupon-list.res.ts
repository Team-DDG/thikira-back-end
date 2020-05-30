import { ApiProperty } from '@nestjs/swagger';

export class ResGetCouponList {
  @ApiProperty()
  public readonly expiredDay: Date;
  @ApiProperty()
  public readonly discountAmount: number;
  @ApiProperty()
  public readonly isExpired: boolean;
}
