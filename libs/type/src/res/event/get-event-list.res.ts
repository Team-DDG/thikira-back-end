import { ApiProperty } from '@nestjs/swagger';

export class ResGetEventList {
  @ApiProperty()
  public readonly bannerImage: string;
  @ApiProperty()
  public readonly mainImage: string;
}
