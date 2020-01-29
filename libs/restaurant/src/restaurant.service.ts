import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckEmailDto } from './dto';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(@InjectRepository(Restaurant)
              public readonly users: Repository<Restaurant>) {
  }

  private async find_restaurant_by_email(email: string) {
    return new Restaurant(this.users.findOne({ email }));
  }

  public async check_email(payload: CheckEmailDto): Promise<void> {
    const found_restaurant: Restaurant = await this.find_restaurant_by_email(payload.email);
    if (!found_restaurant.isEmpty()) {
      throw new ConflictException();
    }
  }
}
