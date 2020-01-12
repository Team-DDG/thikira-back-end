import { ApiProperty } from '@nestjs/swagger';

export class ResSignIn {
  @ApiProperty()
  public readonly accessToken: string;

  constructor(token) {
    Object.assign(this, token);
  }
}
