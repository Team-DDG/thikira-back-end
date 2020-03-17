import { ApiProperty } from '@nestjs/swagger';

export class ResLoadUser {
  @ApiProperty() public readonly add_parcel: string;
  @ApiProperty() public readonly add_street: string;
  @ApiProperty() public readonly create_time: Date;
  @ApiProperty() public readonly nickname: string;
  @ApiProperty() public readonly phone: string;
}
