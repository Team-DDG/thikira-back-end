import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class DtoEditMenu {
  @ApiProperty({
    description: '메뉴 아이디',
    example: 10,
  })
  @IsNumber()
  public readonly m_id: number;
  @ApiProperty({
    description: '메뉴 이름',
    example: '스모크 치킨',
  })
  @IsString()
  @IsOptional()
  public readonly name?: string;
  @ApiProperty({
    description: '가격',
    example: 17000,
  })
  @IsNumber()
  @IsOptional()
  public readonly price?: number;
  @ApiProperty({
    description: '설명',
    example: '물참나무 향 솔솔~ 담백한 엉치살 구이',
  })
  @IsString()
  @IsOptional()
  public readonly description?: string;
  @ApiProperty({
    description: '사진',
    example: 'image.url',
  })
  @IsUrl()
  @IsOptional()
  public readonly image?: string;
  @ApiProperty({
    description: '옵션',
    example: [{
      name: '순살',
      price: 1000,
    }, {
      name: '매운맛',
      price: 0,
    }],
  })
  @IsArray()
  @IsOptional()
  public readonly group?: Array<{
    group_id: number,
    name: string,
    max_count: number,
    option: Array<{
      option_id: number,
      name: string,
      price: number,
    }>,
  }>;
}
