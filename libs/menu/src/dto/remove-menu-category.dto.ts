import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DtoRemoveMenuCategory {
  @ApiProperty({
    name: '메뉴 카데고리 아이디',
    example: 1
  })
  @IsNumber()
  public readonly id: number;
}
