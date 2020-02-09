import { ApiProperty } from '@nestjs/swagger';
import { ResGetOption } from './get-option.res';

export class ResGetGroup {
  @ApiProperty({
    description: '그룹 아이디',
    example: 0,
  })
  public readonly group_id: number;
  @ApiProperty({
    description: '그룹 이름',
    example: '치킨 유형',
  })
  public readonly name: string;
  @ApiProperty({
    description: '최대 선택 개수',
    example: 1,
  })
  public readonly max_count: number;
  @ApiProperty({
    description: '옵션',
    example: [
      { option_id: 0, name: '순살', price: 1000 },
      { option_id: 1, name: '뼈', price: 0 },
    ],
  })
  public readonly option: ResGetOption[];

  constructor(payload?) {
    if (payload !== undefined) {
      const group_data = { group_id: payload.id, ...payload, id: undefined };
      delete group_data.id;
      Object.assign(this, group_data);
      this.option = new Array<ResGetOption>();
    }
  }
}
