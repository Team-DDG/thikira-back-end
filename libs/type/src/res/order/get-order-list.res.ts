import { ApiProperty } from '@nestjs/swagger';
import { BaseOrderClass } from '../../etc';

export class ResGetOrderList extends BaseOrderClass {
  @ApiProperty()
  public readonly userId: number;
  @ApiProperty()
  public readonly restaurantId: number;
}
