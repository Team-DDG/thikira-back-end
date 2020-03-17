import { ApiProperty } from '@nestjs/swagger';

export class ResLoadRestaurant {
  @ApiProperty() public readonly add_parcel: string;
  @ApiProperty() public readonly add_street: string;
  @ApiProperty() public readonly area: string;
  @ApiProperty() public readonly category: string;
  @ApiProperty() public readonly close_time: string;
  @ApiProperty() public readonly create_time: Date;
  @ApiProperty() public readonly day_off: string;
  @ApiProperty() public readonly description: string;
  @ApiProperty() public readonly image: string;
  @ApiProperty() public readonly min_price: number;
  @ApiProperty() public readonly name: string;
  @ApiProperty() public readonly offline_payment: boolean;
  @ApiProperty() public readonly online_payment: boolean;
  @ApiProperty() public readonly open_time: string;
  @ApiProperty() public readonly phone: string;
}
