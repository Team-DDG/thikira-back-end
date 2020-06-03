import { ApiProperty } from '@nestjs/swagger';

export class ResLoadRestaurant {
  @ApiProperty()
  public readonly address: string;
  @ApiProperty()
  public readonly roadAddress: string;
  @ApiProperty()
  public readonly area: string;
  @ApiProperty()
  public readonly category: string;
  @ApiProperty()
  public readonly closeTime: string;
  @ApiProperty()
  public readonly createTime: Date;
  @ApiProperty()
  public readonly dayOff: string;
  @ApiProperty()
  public readonly description: string;
  @ApiProperty()
  public readonly email: string;
  @ApiProperty()
  public readonly image: string;
  @ApiProperty()
  public readonly minPrice: number;
  @ApiProperty()
  public readonly name: string;
  @ApiProperty()
  public readonly offlinePayment: boolean;
  @ApiProperty()
  public readonly onlinePayment: boolean;
  @ApiProperty()
  public readonly openTime: string;
  @ApiProperty()
  public readonly phone: string;
}
