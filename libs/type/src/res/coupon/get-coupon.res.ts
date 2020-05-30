import { ApiProperty } from '@nestjs/swagger';

export class ResGetCoupon {
  @ApiProperty()
  public readonly discountAmount: number;
  @ApiProperty()
  public readonly expiredDay: Date;
}
