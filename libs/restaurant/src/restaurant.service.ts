import { CheckEmailDto, CheckPasswordDto, ResRefresh, ResSignIn, TokenTypeEnum, UtilService } from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignInDto, SignUpDto } from './dto';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(@InjectRepository(Restaurant)
              private readonly restaurants: Repository<Restaurant>,
              private readonly util: UtilService,
  ) {
  }

  private async find_restaurant_by_id(id: number): Promise<Restaurant> {
    return new Restaurant(await this.restaurants.findOne(id));
  }

  private async find_restaurant_by_email(email: string): Promise<Restaurant> {
    return new Restaurant(await this.restaurants.findOne({ email }));
  }

  private async delete_restaurant(email: string): Promise<void> {
    await this.restaurants.delete({ email });
  }

  private async update_restaurant(email: string, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util.encode(payload.password);
    }
    await this.restaurants.update({ email }, payload);
  }

  private async insert_restaurant(restaurant: Restaurant) {
    await this.restaurants.insert(restaurant);
  }

  public async sign_up(payload: SignUpDto): Promise<void> {
    await this.insert_restaurant(new Restaurant({
      ...payload,
      password: await this.util.encode(payload.password),
    }));
  }

  public async check_email(payload: CheckEmailDto): Promise<void> {
    const found_restaurant: Restaurant = await this.find_restaurant_by_email(payload.email);
    if (!found_restaurant.isEmpty()) {
      throw new ConflictException();
    }
  }

  public async sign_in(payload: SignInDto): Promise<ResSignIn> {
    const found_restaurant: Restaurant = await this.find_restaurant_by_email(payload.email);
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
    await this.delete_restaurant(email);
  }

  public async check_password(token: string, payload: CheckPasswordDto): Promise<void> {
    const email: string = await this.util.getEmailByToken(token);
    const found_restaurant: Restaurant = await this.find_restaurant_by_email(email);
    if (await this.util.encode(payload.password) !== found_restaurant.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload) {
    const email: string = await this.util.getEmailByToken(token);
    await this.update_restaurant(email, payload);
  }

  public async load(token: string): Promise<Restaurant> {
    const email: string = await this.util.getEmailByToken(token);
    const found_restaurant: Restaurant = await this.find_restaurant_by_email(email);
    return new Restaurant({ ...found_restaurant, _id: undefined, password: undefined, email: undefined });
  }
}
