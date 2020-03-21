import { IsISO8601, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoUploadCoupon {
  @ApiProperty() @IsNumber()
  public readonly discount_amount: number;
  @ApiProperty() @IsISO8601()
  public readonly expired_day: Date;
}
