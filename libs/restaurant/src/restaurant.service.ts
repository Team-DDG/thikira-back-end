import { MongoService } from '@app/mongo';
import { TokenService } from '@app/token';
import { UtilService } from '@app/util';
import { ConflictException, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { CheckEmailDto, SignUpDto } from './dto';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class RestaurantService {
  private readonly restaurants: Collection<Restaurant>;

  constructor(mongo: MongoService,
              private readonly token: TokenService,
              private readonly util: UtilService) {
    this.restaurants = mongo.collection('restaurants');
  }

  private async find_restaurant(email: string): Promise<Restaurant> {
    return new Restaurant(await this.restaurants.findOne({ email: { $eq: email } }));
  }

  public async sign_up(payload: SignUpDto): Promise<void> {
    const restaurant: Restaurant = new Restaurant({
      ...payload,
      password: await this.util.encode(payload.password),
    });
    await this.restaurants.insertOne(restaurant);
  }

  public async check_email(payload: CheckEmailDto): Promise<void> {
    const found_restaurant = await this.find_restaurant(payload.email);
    if (!found_restaurant.isEmpty()) {
      throw new ConflictException();
    }
  }
}
