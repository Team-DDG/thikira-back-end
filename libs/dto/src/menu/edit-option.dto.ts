import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DtoEditOption {
  @ApiProperty({
    description: '옵션 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly o_id: number;

  @ApiProperty({
    description: '가격',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  public readonly price?: number;

  @ApiProperty({
    description: '옵션 이름',
    example: '순살',
  })
  @IsString()
  @IsOptional()
  public readonly name?: string;
}
