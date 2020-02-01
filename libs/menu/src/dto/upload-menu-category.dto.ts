import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadMenuCategoryDto {
  @ApiProperty({
    description: '메뉴 카테고리 이름 이름',
    example: '치킨',
  })
  @IsString()
  public readonly name: string;
}
