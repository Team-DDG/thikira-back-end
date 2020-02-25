import { ApiProperty } from '@nestjs/swagger';
import { Option } from '@app/db';
import { stringify } from 'querystring';

export class ResGetOption {
  @ApiProperty() public readonly name: string;
  @ApiProperty() public readonly o_id: number;
  @ApiProperty() public readonly price: number;

  constructor(option?) {
    if (option !== undefined) {
      if (option instanceof Option) {
        this.name = option.o_name;
        this.o_id = option.o_id;
        this.price = option.o_price;
      } else {
        Object.assign(this, option);
      }
    }
  }

  public is_empty() {
    return !this.name;
  }

  public get(): string {
    return stringify({
      name: this.name,
      price: this.price,
    });
  }
}
