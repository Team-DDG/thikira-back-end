import { ApiProperty } from '@nestjs/swagger';

export class ResUploadMenu {
  @ApiProperty()
  public readonly menuId: number;
}
