import { ApiProperty } from '@nestjs/swagger';

export class ResRefresh {
  @ApiProperty()
  public readonly access_token: string;

  constructor(token) {
    Object.assign(this, token);
  }
}
