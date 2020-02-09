import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DtoRemoveGroup {
  @ApiProperty({
    description: '그룹 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly group_id: number;
}
