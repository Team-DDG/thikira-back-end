import { ApiProperty } from '@nestjs/swagger';

export class ResUploadGroup {
  @ApiProperty({
    description: '그룹 아이디',
    example: 0,
  })
  public readonly g_id: number;
}
