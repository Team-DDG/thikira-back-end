import { IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoUploadCoupon {
  @ApiProperty() @IsDate()
  public readonly expired_day: Date;
  @ApiProperty() @IsNumber()
  public readonly discount_amount: number;
}
