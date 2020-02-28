import { ApiProperty } from '@nestjs/swagger';
import { OrderDetailOptionClass } from './order-detail-option.class';

export class OrderDetailGroupClass {
  @ApiProperty()
  public readonly name: string;
  @ApiProperty({type: [OrderDetailOptionClass]})
  public readonly option: OrderDetailOptionClass[];

  constructor(param?) {
    if (param !== undefined) {
      this.name = param.name;
      this.option = new Array<OrderDetailOptionClass>();
    }
  }
}
