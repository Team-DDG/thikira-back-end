import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DtoGetOptionList {
  @ApiProperty({
    description: '그룹 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly g_id: number;
}
