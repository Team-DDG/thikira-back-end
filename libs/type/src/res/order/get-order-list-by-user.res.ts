import { ApiProperty } from '@nestjs/swagger';
import { BaseOrderClass } from '../..';

export class ResGetOrderListByUser extends BaseOrderClass {
  @ApiProperty()
  public readonly r_id: number;
}
