import { ApiProperty } from '@nestjs/swagger';

export class ResUploadMenuCategory {
  @ApiProperty({
    description: '메뉴 카테고리 아이디',
    example: 0,
  })
  public readonly mc_id: number;
}
