import { ApiProperty } from '@nestjs/swagger';

export class ResGetMenuCategoryList {
  @ApiProperty()
  public readonly menuCategoryId: number;
  @ApiProperty()
  public readonly name: string;
}
