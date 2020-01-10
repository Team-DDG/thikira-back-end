import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';

@ApiTags('Restaurant')
@Controller('api/restaurant')
export class RestaurantController {
  constructor(private readonly service: RestaurantService) {
  }
}
