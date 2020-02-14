import { ApiProperty } from '@nestjs/swagger';
import { stringify } from 'querystring';

export class ResGetMenuCategory {
  @ApiProperty({
    description: '메뉴 카테고리 아이디',
    example: 0,
  })
  public readonly mc_id: number;
  @ApiProperty({
    description: '메뉴 카테고리 이름',
    example: '치킨',
  })
  public readonly name: string;

  public is_empty() {
    return !this.name;
  }

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      name: this.name,
    });
  }
}
