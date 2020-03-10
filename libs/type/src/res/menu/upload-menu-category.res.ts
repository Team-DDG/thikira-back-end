import { ApiProperty } from '@nestjs/swagger';

export class ResUploadMenuCategory {
  @ApiProperty() public readonly mc_id: number;
}
