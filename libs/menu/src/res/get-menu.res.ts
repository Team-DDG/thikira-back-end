import { ApiProperty } from '@nestjs/swagger';
import { ResGetGroup } from './get-group.res';

export class ResGetMenu {
  @ApiProperty({
    description: '메뉴 아이디',
    example: 0,
  })
  public readonly menu_id: number;
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
      group_id: 1, name: '치킨 유형',
      max_count: 2, option: [
        { option_id: 1, name: '순살', price: 1000 },
        { option_id: 2, name: '뼈', price: 0 },
      ],
    }, {
      group_id: 2, name: '소스',
      max_count: 0, option: [
        { option_id: 3, name: '갈릭 소스', price: 500 },
        { option_id: 4, name: '양념 소스', price: 500 },
      ],
    }],
  })
  public readonly group?: ResGetGroup[];

  constructor(payload?) {
    if (payload !== undefined) {
      const menu_data = { menu_id: payload.id, ...payload, id: undefined };
      delete menu_data.id;
      Object.assign(this, menu_data);
      this.group = new Array<ResGetGroup>();
    }
  }
}
