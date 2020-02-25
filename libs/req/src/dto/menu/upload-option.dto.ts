import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { stringify } from "querystring";

export class DtoUploadOption {
  @ApiProperty({
    description: '그룹 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly g_id: number;
  @ApiProperty({
    description: '가격',
    example: 0,
  })
  @IsNumber()
  public readonly price: number;
  @ApiProperty({
    description: '옵션 이름',
    example: '순살',
  })
  @IsString()
  public readonly name: string;

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      name: this.name,
      price: this.price,
    });
  }
}
