import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DtoRemoveMenu {
  @ApiProperty({
    description: '메뉴 아이디',
    example: 10,
  })
  @IsNumber()
  public readonly menu_id: number;
}
