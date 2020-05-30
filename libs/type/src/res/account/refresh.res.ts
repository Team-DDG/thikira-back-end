import { ApiProperty } from '@nestjs/swagger';

export class ResRefresh {
  @ApiProperty()
  public readonly accessToken: string;
}
