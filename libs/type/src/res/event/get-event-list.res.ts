import { ApiProperty } from '@nestjs/swagger';

export class ResGetEventList {
  @ApiProperty()
  public readonly banner_image: string;
  @ApiProperty()
  public readonly main_image: string;
}
