import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DtoRemoveOption {
  @ApiProperty({
    description: '옵션 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly option_id: number;
}
