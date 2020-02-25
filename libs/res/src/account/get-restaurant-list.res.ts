import { ApiProperty } from '@nestjs/swagger';
import { ResLoadRestaurant } from './load-restaurant.res';
import { Restaurant } from '@app/db';

export class ResGetRestaurantList extends ResLoadRestaurant {
  @ApiProperty() public readonly r_id: number;

  constructor(restaurant?: Restaurant) {
    super(restaurant);
    if (restaurant !== undefined) {
      if (restaurant instanceof Restaurant) {
        this.r_id = restaurant.r_id;
      }
    }
  }
}
