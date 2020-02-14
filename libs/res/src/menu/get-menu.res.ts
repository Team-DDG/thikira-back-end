import { Menu } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
import { stringify } from "querystring";
import { ResGetGroup } from './get-group.res';

export class ResGetMenu {
  @ApiProperty({
    description: '메뉴 아이디',
    example: 0,
  })
  public readonly m_id: number;
  @ApiProperty({
    description: '이름',
    example: '스모크 치킨',
  })
  public readonly name: string;
  @ApiProperty({
    description: '가격',
    example: 18000,
  })
  public readonly price: number;
  @ApiProperty({
    description: '설명',
    example: '물참나무 향 솔솔~ 담백한 엉치살 구',
  })
  public readonly description: string;
  @ApiProperty({
    description: '사진',
    example: 0,
  })
  public readonly image: string;
  @ApiProperty({
    description: '그룹',
    example: [{
      g_id: 1, name: '치킨 유형',
      max_count: 2, option: [
        { o_id: 1, name: '순살', price: 1000 },
        { o_id: 2, name: '뼈', price: 0 },
      ],
    }, {
      g_id: 2, name: '소스',
      max_count: 0, option: [
        { o_id: 3, name: '갈릭 소스', price: 500 },
        { o_id: 4, name: '양념 소스', price: 500 },
      ],
    }],
  })
  public readonly group?: ResGetGroup[];

  constructor(payload?: Menu | ResGetMenu) {
    if (payload !== undefined) {
      if (payload instanceof Menu) {
        this.m_id = payload.m_id;
        this.name = payload.m_name;
        this.price = payload.m_price;
        this.description = payload.m_description;
        this.image = payload.m_image;
        this.group = new Array<ResGetGroup>();
      } else {
        Object.assign(this, payload);
      }
    }
  }

  public is_empty() {
    return !this.name;
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
