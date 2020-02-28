import { ApiProperty } from '@nestjs/swagger';
import { OrderDetailGroupClass } from './order-detail-group.class';

export class OrderDetailClass {
  @ApiProperty()
  public readonly name: string;
  @ApiProperty()
  public readonly price: number;
  @ApiProperty()
  public readonly quantity: number;
  @ApiProperty()
  public readonly sub_price: number;
  @ApiProperty({ type: [OrderDetailGroupClass] })
  public readonly group: OrderDetailGroupClass[];

  constructor(param?) {
    if (param !== undefined) {
      this.name = param.name;
      this.price = param.price;
      this.quantity = param.quantity;
      this.sub_price = param.sub_price;
      this.group = new Array<OrderDetailGroupClass>();
    }
  }
}
