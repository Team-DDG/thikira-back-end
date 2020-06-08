import { ApiProperty } from '@nestjs/swagger';
import { BaseOrderClass } from '../../etc';

export class ResGetOrderListByUser extends BaseOrderClass {
  @ApiProperty()
  public readonly restaurantId: number;
}
