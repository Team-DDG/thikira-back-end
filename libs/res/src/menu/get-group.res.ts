import { Group } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
import { stringify } from "querystring";
import { ResGetOption } from './get-option.res';

export class ResGetGroup {
  @ApiProperty({
    description: '그룹 아이디',
    example: 0,
  })
  public readonly g_id: number;
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
      { o_id: 0, name: '순살', price: 1000 },
      { o_id: 1, name: '뼈', price: 0 },
    ],
  })
  public readonly option: ResGetOption[];

  constructor(payload?: Group | ResGetGroup) {
    if (payload !== undefined) {
      if (payload instanceof Group) {
        this.g_id = payload.g_id;
        this.name = payload.g_name;
        this.max_count = payload.g_max_count;
        this.option = new Array<ResGetOption>();
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
      max_count: this.max_count,
    });
  }
}
