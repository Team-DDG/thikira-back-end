import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DtoEditMenuCategory {
  @ApiProperty({
    description: '메뉴 카테고리 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly mc_id: number;

  @ApiProperty({
    description: '메뉴 카테고리 이름',
    example: '치킨',
  })
  @IsString()
  public readonly name: string;
}
