import { ApiProperty } from '@nestjs/swagger';

export class ResGetMenuCategoryList {
  @ApiProperty() public readonly mc_id: number;
  @ApiProperty() public readonly name: string;
}
