import { ApiProperty } from '@nestjs/swagger';

export class ResUploadMenu {
  @ApiProperty({
    description: '메뉴 아이디',
    example: 0,
  })
  public readonly m_id: number;
}
