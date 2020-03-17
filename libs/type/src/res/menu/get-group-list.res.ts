import { ApiProperty } from '@nestjs/swagger';
import { ResGetOptionList } from './get-option-list.res';

export class ResGetGroupList {
  @ApiProperty() public readonly g_id: number;
  @ApiProperty() public readonly max_count: number;
  @ApiProperty() public readonly name: string;
  @ApiProperty() public readonly o?: ResGetOptionList[];
}
