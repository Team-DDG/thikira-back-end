import { ApiProperty } from '@nestjs/swagger';
import { ResGetOptionList } from './get-option-list.res';

export class ResGetGroupList {
  @ApiProperty()
  public readonly groupId: number;
  @ApiProperty()
  public readonly maxCount: number;
  @ApiProperty()
  public readonly name: string;
  @ApiProperty()
  public readonly option?: ResGetOptionList[];
}
