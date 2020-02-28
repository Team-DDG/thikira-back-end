import { ApiProperty } from '@nestjs/swagger';

export class OrderDetailOptionClass {
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public price: number;

  constructor(param?) {
    if (param !== undefined) {
      this.name = param.name;
      this.price = param.price;
    }
  }
}
