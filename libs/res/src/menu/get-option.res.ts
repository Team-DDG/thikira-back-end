import { Option } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
import { stringify } from "querystring";

export class ResGetOption {
  @ApiProperty({
    description: '옵션 아이디',
    example: 0,
  })
  public readonly o_id: number;
  @ApiProperty({
    description: '옵션 이름',
    example: '순살',
  })
  public readonly name: string;
  @ApiProperty({
    description: '가격',
    example: 1000,
  })
  public readonly price: number;

  constructor(option?) {
    if (option !== undefined) {
      if (option instanceof Option) {
        this.o_id = option.o_id;
        this.name = option.o_name;
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
