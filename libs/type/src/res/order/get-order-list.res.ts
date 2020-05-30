import { EnumOrderStatus, EnumPaymentType, OrderDetail } from '@app/entity';
import { ApiProperty } from '@nestjs/swagger';

export class ResGetOrderList {
  @ApiProperty()
  public readonly orderId: string;
  @ApiProperty()
  public readonly addStreet: string;
  @ApiProperty()
  public readonly addParcel: string;
  @ApiProperty()
  public readonly createTime: Date;
  @ApiProperty()
  public readonly discountAmount: number;
  @ApiProperty()
  public readonly nickname: string;
  @ApiProperty({ type: [OrderDetail] })
  public readonly orderDetail: OrderDetail[];
  @ApiProperty()
  public readonly paymentType: EnumPaymentType = EnumPaymentType.OFFLINE;
  @ApiProperty()
  public readonly phone: string;
  @ApiProperty()
  public readonly status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @ApiProperty()
  public readonly totalPrice: number;
}
