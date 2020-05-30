import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNumber } from 'class-validator';

export class DtoUploadCoupon {
  @ApiProperty() @IsNumber()
  public readonly discountAmount: number;
  @ApiProperty() @IsISO8601()
  public readonly expiredDay: Date;
}
