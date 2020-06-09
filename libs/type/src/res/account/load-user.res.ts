import { ApiProperty } from '@nestjs/swagger';

export class ResLoadUser {
  @ApiProperty()
  public readonly address: string;
  @ApiProperty()
  public readonly road_address: string;
  @ApiProperty()
  public readonly create_time: Date;
  @ApiProperty()
  public readonly nickname: string;
  @ApiProperty()
  public readonly phone: string;
}
