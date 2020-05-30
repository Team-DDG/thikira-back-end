import { ApiProperty } from '@nestjs/swagger';

export class ResLoadUser {
  @ApiProperty()
  public readonly addParcel: string;
  @ApiProperty()
  public readonly addStreet: string;
  @ApiProperty()
  public readonly createTime: Date;
  @ApiProperty()
  public readonly nickname: string;
  @ApiProperty()
  public readonly phone: string;
}
