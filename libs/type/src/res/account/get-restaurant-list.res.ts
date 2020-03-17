import { ApiProperty } from '@nestjs/swagger';
import { ResLoadRestaurant } from './load-restaurant.res';

export class ResGetRestaurantList extends ResLoadRestaurant {
  @ApiProperty() public readonly r_id: number;
}
