import { ApiProperty } from '@nestjs/swagger';
import { ResGetGroupList } from './';

export class ResGetMenuList {
  @ApiProperty() public readonly description: string;
  @ApiProperty() public readonly g?: ResGetGroupList[];
  @ApiProperty() public readonly image: string;
  @ApiProperty() public readonly m_id: number;
  @ApiProperty() public readonly name: string;
  @ApiProperty() public readonly price: number;
}
