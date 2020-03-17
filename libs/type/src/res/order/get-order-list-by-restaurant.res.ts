import { EnumOrderStatus, EnumPaymentType, OrderDetail } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class ResGetOrderListByRestaurant {
  @ApiProperty() public readonly od_id: string;
  @ApiProperty() public readonly create_time: Date;
  @ApiProperty({ type: [OrderDetail] })
  public readonly order_detail: OrderDetail[];
  @ApiProperty() public readonly payment_type: EnumPaymentType = EnumPaymentType.OFFLINE;
  @ApiProperty() public readonly discount_amount: number;
  @ApiProperty() public readonly status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @ApiProperty() public readonly total_price: number;
}
