import { ApiProperty } from '@nestjs/swagger';
import { Group } from '@app/db';
import { ResGetOption } from './get-option.res';
import { stringify } from 'querystring';

export class ResGetGroup {
  @ApiProperty() public readonly g_id: number;
  @ApiProperty() public readonly max_count: number;
  @ApiProperty() public readonly name: string;
  @ApiProperty() public readonly option: ResGetOption[];

  constructor(group?) {
    if (group !== undefined) {
      if (group instanceof Group) {
        this.g_id = group.g_id;
        this.max_count = group.g_max_count;
        this.name = group.g_name;
        this.option = new Array<ResGetOption>();
      } else {
        Object.assign(this, group);
      }
    }
  }

  public is_empty() {
    return !this.name;
  }

  public get(): string {
    return stringify({
      max_count: this.max_count,
      name: this.name,
    });
  }
}
