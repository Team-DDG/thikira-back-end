import { ApiProperty } from '@nestjs/swagger';
import { ResGetOrderListByUser } from './get-order-list-by-user.res';

export class ResGetOrderListByRestaurant extends ResGetOrderListByUser{
  @ApiProperty()
  public readonly od_id: string;
}
