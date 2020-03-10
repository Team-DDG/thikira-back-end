import { IsISO8601, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoUploadCoupon {
  @ApiProperty() @IsISO8601()
  public readonly expired_day: Date;
  @ApiProperty() @IsNumber()
  public readonly discount_amount: number;
}
