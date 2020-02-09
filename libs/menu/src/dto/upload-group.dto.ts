import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { OptionData } from '../class';

export class DtoUploadGroup {
  @ApiProperty({
    description: '메뉴 아이디',
    example: 0,
  })
  @IsNumber()
  public readonly menu_id: number;
  @ApiProperty({
    description: '최대 선택 개수 (0은 무제한)',
    example: 0,
  })
  @IsNumber()
  public readonly max_count: number;
  @ApiProperty({
    description: '그룹 이름',
    example: '치킨',
  })
  @IsString()
  public readonly name: string;
  @ApiProperty({
    description: '그룹 이름',
    example: [
      { name: '순살', price: 1000 },
      { name: '뼈', price: 0 },
    ],
  })
  @IsArray()
  @IsOptional()
  public readonly option?: OptionData[];

  constructor(payload) {
    Object.assign(this, payload);
  }
}
