import { ApiProperty } from '@nestjs/swagger';

export class ResUploadOption {
  @ApiProperty({
    description: '옵션 아이디',
    example: 0,
  })
  public readonly o_id: number;
}
