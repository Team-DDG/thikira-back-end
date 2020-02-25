import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { stringify } from "querystring";
import { DtoUploadGroup } from './upload-group.dto';

export class DtoUploadMenu {
  @ApiProperty({
    description: '메뉴 카테고리 아이디',
    example: 10,
  })
  @IsNumber()
  public readonly mc_id: number;
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
    description: '옵션',
    example: [{
      name: '치킨 유형',
      max_count: 1,
      option: [
        { name: '순살', price: 1000 },
        { name: '뼈', price: 0 }],
    }, {
      name: '소스',
      max_count: 0,
      option: [
        { name: '갈릭소스', price: 500 },
        { name: '양념 소스', price: 500 }],
    }],
  })
  @IsArray()
  @IsOptional()
  public readonly group?: DtoUploadGroup[];

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      name: this.name,
      price: this.price,
      description: this.description,
      image: this.image,
    });
  }
}
