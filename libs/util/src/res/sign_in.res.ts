import { ApiProperty } from '@nestjs/swagger';

export class ResSignIn {
  @ApiProperty()
  public readonly accessToken: string;

  @ApiProperty()
  public readonly refreshToken: string;

  constructor(token) {
    Object.assign(this, token);
  }
}
