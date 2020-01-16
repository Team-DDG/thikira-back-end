import { MongoService } from '@app/mongo';
import { ResRefresh, ResSignIn, TokenTypeEnum, UtilService } from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { CheckEmailDto, CheckPasswordDto, SignInDto, SignUpDto } from './dto';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class RestaurantService {
  private readonly restaurants: Collection<Restaurant>;

  constructor(mongo: MongoService,
              private readonly util: UtilService) {
    this.restaurants = mongo.collection('restaurants');
  }

  private async find_restaurant(param: string | ObjectId): Promise<Restaurant> {
    if (typeof param === 'string') {
      return new Restaurant(await this.restaurants.findOne({ email: { $eq: param } }));
    } else if (param instanceof ObjectId) {
      return new Restaurant(await this.restaurants.findOne(param));
    }
  }

  private async delete_restaurant(email: string): Promise<void> {
    await this.restaurants.deleteOne({ email: { $eq: email } });
  }

  private async update_restaurant(email: string, payload): Promise<void> {
    payload.password = payload.password ? await this.util.encode(payload.password) : undefined;
    await this.restaurants.updateOne({ email: { $eq: email } }, { $set: { ...payload } });
  }

  public async sign_up(payload: SignUpDto): Promise<void> {
    const restaurant: Restaurant = new Restaurant({
      ...payload,
      password: await this.util.encode(payload.password),
    });
    await this.restaurants.insertOne(restaurant);
  }

  public async check_email(payload: CheckEmailDto): Promise<void> {
    const found_restaurant: Restaurant = await this.find_restaurant(payload.email);
    if (!found_restaurant.isEmpty()) {
      throw new ConflictException();
    }
  }

  public async sign_in(payload: SignInDto): Promise<ResSignIn> {
    const found_restaurant: Restaurant = await this.find_restaurant(payload.email);
    if (found_restaurant.isEmpty() ||
      found_restaurant.password !== await this.util.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      accessToken: await this.util.createToken(payload.email, TokenTypeEnum.access),
      refreshToken: await this.util.createToken(payload.email, TokenTypeEnum.refresh),
    };
  }

  public async refresh(token: string): Promise<ResRefresh> {
    const email: string = await this.util.getEmailByToken(token);
    return { accessToken: await this.util.createToken(email, TokenTypeEnum.access) };
  }

  public async leave(token: string): Promise<void> {
    const email: string = await this.util.getEmailByToken(token);
    this.delete_restaurant(email);
  }

  public async check_password(token: string, payload: CheckPasswordDto): Promise<void> {
    const email: string = await this.util.getEmailByToken(token);
    const found_restaurant: Restaurant = await this.find_restaurant(email);
    if (await this.util.encode(payload.password) !== found_restaurant.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload) {
    const email: string = await this.util.getEmailByToken(token);
    this.update_restaurant(email, payload);
  }
}
