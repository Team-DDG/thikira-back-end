import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ResGetMenuCategory {
  @ApiProperty({
    description: '메뉴 카테고리 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly menu_category_id: number;

  @ApiProperty({
    description: '메뉴 카테고리 이름',
    example: '치킨',
  })
  @IsString()
  public readonly name: string;

  constructor(payload) {
    Object.assign(this, payload);
  }
}
