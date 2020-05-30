import { ApiProperty } from '@nestjs/swagger';

export class ResUploadOption {
  @ApiProperty()
  public readonly optionId: number;
}
