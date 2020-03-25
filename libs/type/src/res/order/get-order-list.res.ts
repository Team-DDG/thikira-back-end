import { EnumOrderStatus, EnumPaymentType, OrderDetail } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class ResGetOrderList {
  @ApiProperty()
  public readonly od_id: string;
  @ApiProperty()
  public readonly add_street: string;
  @ApiProperty()
  public readonly add_parcel: string;
  @ApiProperty()
  public readonly create_time: Date;
  @ApiProperty()
  public readonly discount_amount: number;
  @ApiProperty()
  public readonly nickname: string;
  @ApiProperty({ type: [OrderDetail] })
  public readonly order_detail: OrderDetail[];
  @ApiProperty()
  public readonly payment_type: EnumPaymentType = EnumPaymentType.OFFLINE;
  @ApiProperty()
  public readonly phone: string;
  @ApiProperty()
  public readonly status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @ApiProperty()
  public readonly total_price: number;
}
