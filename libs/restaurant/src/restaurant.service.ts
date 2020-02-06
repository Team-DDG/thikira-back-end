import {
  CheckEmailDto, CheckPasswordDto, ResRefresh,
  ResSignIn, SignInDto, TokenTypeEnum, UtilService,
} from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto';
import { ResLoad } from './res';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(@InjectRepository(Restaurant)
              private readonly restaurant_repo: Repository<Restaurant>,
              private readonly util: UtilService,
  ) {
  }

  private async find_restaurant_by_id(id: number): Promise<Restaurant> {
    return new Restaurant(await this.restaurant_repo.findOne(id));
  }

  private async find_restaurant_by_email(email: string): Promise<Restaurant> {
    return new Restaurant(await this.restaurant_repo.findOne({ email }));
  }

  private async delete_restaurant(email: string): Promise<void> {
    await this.restaurant_repo.delete({ email });
  }

  private async update_restaurant(email: string, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util.encode(payload.password);
    }
    await this.restaurant_repo.update({ email }, payload);
  }

  private async insert_restaurant(restaurant: Restaurant) {
    await this.restaurant_repo.insert(restaurant);
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
      access_token: await this.util.create_token(payload.email, TokenTypeEnum.access),
      refresh_token: await this.util.create_token(payload.email, TokenTypeEnum.refresh),
    };
  }

  public async refresh(token: string): Promise<ResRefresh> {
    const email: string = await this.util.get_email_by_token(token);
    return { access_token: await this.util.create_token(email, TokenTypeEnum.access) };
  }

  public async leave(token: string): Promise<void> {
    const email: string = await this.util.get_email_by_token(token);
    await this.delete_restaurant(email);
  }

  public async check_password(token: string, payload: CheckPasswordDto): Promise<void> {
    const email: string = await this.util.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.find_restaurant_by_email(email);
    if (await this.util.encode(payload.password) !== found_restaurant.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload) {
    const email: string = await this.util.get_email_by_token(token);
    await this.update_restaurant(email, payload);
  }

  public async load(token: string): Promise<ResLoad> {
    const email: string = await this.util.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.find_restaurant_by_email(email);
    return new Restaurant({ ...found_restaurant, menu_category: undefined, id: undefined, password: undefined, email: undefined });
  }
}
