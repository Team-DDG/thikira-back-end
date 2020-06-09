import { EnumOrderStatus, EnumPaymentType, OrderDetail } from '@app/entity';
import { ApiProperty } from '@nestjs/swagger';

export class BaseOrderClass {
  @ApiProperty()
  public readonly od_id: string;
  @ApiProperty()
  public readonly road_address: string;
  @ApiProperty()
  public readonly address: string;
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
