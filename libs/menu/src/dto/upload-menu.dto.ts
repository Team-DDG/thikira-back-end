import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsUrl } from 'class-validator';

export class DtoUploadMenu {
  @ApiProperty({
    description: '메뉴 이름',
    example: '스모크 치킨',
  })
  @IsString()
  public readonly name: string;
  @ApiProperty({
    description: '가격',
    example: 17000,
  })
  @IsNumber()
  public readonly price: number;
  @ApiProperty({
    description: '설명',
    example: '물참나무 향 솔솔~ 담백한 엉치살 구이',
  })
  @IsString()
  public readonly description: string;
  @ApiProperty({
    description: '사진',
    example: 'image.url',
  })
  @IsUrl()
  public readonly image: string;
  @ApiProperty({
    description: '메뉴 카테고리 (키값)',
    example: 10,
  })
  @IsNumber()
  public readonly menu_category: number;
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
  public readonly option: Array<{
    name: string,
    price: number,
  }>;
}
