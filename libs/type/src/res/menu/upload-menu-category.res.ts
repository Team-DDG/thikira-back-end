import { ApiProperty } from '@nestjs/swagger';

export class ResUploadMenuCategory {
  @ApiProperty()
  public readonly menuCategoryId: number;
}
