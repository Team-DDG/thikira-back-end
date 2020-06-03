import { ApiProperty } from '@nestjs/swagger';

export class ResLoadUser {
  @ApiProperty()
  public readonly address: string;
  @ApiProperty()
  public readonly roadAddress: string;
  @ApiProperty()
  public readonly createTime: Date;
  @ApiProperty()
  public readonly nickname: string;
  @ApiProperty()
  public readonly phone: string;
}
