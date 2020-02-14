import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { stringify } from "querystring";

export class DtoUploadMenuCategory {
  @ApiProperty({
    description: '메뉴 카테고리 이름',
    example: '치킨',
  })
  @IsString()
  public readonly name: string;

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      name: this.name,
    });
  }
}