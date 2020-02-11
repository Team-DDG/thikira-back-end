import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DtoEditGroup {
  @ApiProperty({
    description: '그룹 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly g_id: number;

  @ApiProperty({
    description: '최대 선택 개수 (0은 무제한)',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  public readonly max_count?: number;

  @ApiProperty({
    description: '그룹 이름',
    example: '치킨',
  })
  @IsString()
  @IsOptional()
  public readonly name?: string;
}
