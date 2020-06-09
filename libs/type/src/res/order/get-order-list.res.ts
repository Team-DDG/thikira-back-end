import { ApiProperty } from '@nestjs/swagger';
import { BaseOrderClass } from '../..';

export class ResGetOrderList extends BaseOrderClass {
  @ApiProperty()
  public readonly u_id: number;
  @ApiProperty()
  public readonly r_id: number;
}
