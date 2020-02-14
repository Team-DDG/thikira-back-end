import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DtoGetMenuList {
  @ApiProperty({
    description: '메뉴 카테고리 아이디',
    example: 10,
  })
  @IsNumber()
  public readonly mc_id: number;
}
