import { ApiProperty } from '@nestjs/swagger';
import { ResGetGroupList } from './get-group-list.res';

export class ResGetMenuList {
  @ApiProperty()
  public readonly description: string;
  @ApiProperty({ type: [ResGetGroupList] })
  public readonly group?: ResGetGroupList[];
  @ApiProperty()
  public readonly image: string;
  @ApiProperty()
  public readonly m_id: number;
  @ApiProperty()
  public readonly name: string;
  @ApiProperty()
  public readonly price: number;
}
