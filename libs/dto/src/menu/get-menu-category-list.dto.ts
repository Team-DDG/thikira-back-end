import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DtoGetMenuList {
  @ApiProperty({
    description: '레스토랑 아이디',
    example: 10,
  })
  @IsNumber()
  public readonly r_id: number;
}
