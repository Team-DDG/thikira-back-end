import { ApiProperty } from '@nestjs/swagger';

export class ResUploadGroup {
  @ApiProperty() public readonly g_id: number;
}
