import { ApiProperty } from '@nestjs/swagger';
import { BaseOrderClass } from '../../etc';

export class ResGetOrderListByRestaurant extends BaseOrderClass {
  @ApiProperty()
  public readonly userId: number;
}
