import { ApiProperty } from '@nestjs/swagger';
import { BaseOrderClass } from '../..';

export class ResGetOrderListByRestaurant extends BaseOrderClass {
  @ApiProperty()
  public readonly u_id: number;
}
