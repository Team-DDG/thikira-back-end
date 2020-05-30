import { ApiProperty } from '@nestjs/swagger';

export class ResUploadGroup {
  @ApiProperty()
  public readonly groupId: number;
}
