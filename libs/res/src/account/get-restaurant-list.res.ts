import { Restaurant } from '@app/db';
import { ResLoadRestaurant } from '@app/res';
import { ApiProperty } from '@nestjs/swagger';

export class ResGetRestaurantList extends ResLoadRestaurant{
  @ApiProperty()
  public readonly r_id: number;

  constructor(restaurant?: Restaurant) {
    super();
    if (restaurant !== undefined) {
      if (restaurant instanceof Restaurant) {
        this.r_id = restaurant.r_id;
      }
    }
  }
}
