import { ApiProperty } from '@nestjs/swagger';

export class ResSignIn {
  @ApiProperty() public readonly access_token: string;
  @ApiProperty() public readonly refresh_token: string;
}
