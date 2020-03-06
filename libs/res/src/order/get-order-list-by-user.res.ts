import { EnumOrderStatus, EnumPaymentType, Order, OrderDetailClass } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class ResGetOrderListByUser {
  @ApiProperty() public readonly create_time: Date;
  @ApiProperty({ type: [OrderDetailClass] })
  public readonly order_detail: OrderDetailClass[];
  @ApiProperty() public readonly payment_type: EnumPaymentType = EnumPaymentType.OFFLINE;
  @ApiProperty() public readonly discount_amount: number;
  @ApiProperty() public readonly status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @ApiProperty() public readonly total_price: number;

  constructor(order?: Order) {
    if (order instanceof Order) {
      this.create_time = order.od_id.getTimestamp();
      this.order_detail = order.od_detail;
      this.discount_amount = order.od_discount_amount;
      this.status = order.od_status;
      this.total_price = order.od_total_price;
      this.payment_type = order.od_payment_type;
    }
  }
}
