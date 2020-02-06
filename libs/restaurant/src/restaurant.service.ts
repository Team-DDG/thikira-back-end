import { DBService, Restaurant } from '@app/db';
import {
  DtoCheckEmail, DtoCheckPassword, ResRefresh,
  ResSignIn, DtoSignIn, TokenTypeEnum, UtilService,
} from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DtoSignUp } from './dto';
import { ResLoad } from './res';

@Injectable()
export class RestaurantService {
  constructor(private readonly db_service: DBService,
              private readonly util_service: UtilService,
  ) {
  }

  public async sign_up(payload: DtoSignUp): Promise<void> {
    await this.db_service.insert_restaurant(new Restaurant({
      ...payload,
      password: await this.util_service.encode(payload.password),
    }));
  }

  public async check_email(payload: DtoCheckEmail): Promise<void> {
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(payload.email);
    if (!found_restaurant.isEmpty()) {
      throw new ConflictException();
    }
  }

  public async sign_in(payload: DtoSignIn): Promise<ResSignIn> {
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(payload.email);
    if (found_restaurant.isEmpty() ||
      found_restaurant.password !== await this.util_service.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      access_token: await this.util_service.create_token(payload.email, TokenTypeEnum.access),
      refresh_token: await this.util_service.create_token(payload.email, TokenTypeEnum.refresh),
    };
  }

  public async refresh(token: string): Promise<ResRefresh> {
    const email: string = await this.util_service.get_email_by_token(token);
    return { access_token: await this.util_service.create_token(email, TokenTypeEnum.access) };
  }

  public async leave(token: string): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    await this.db_service.delete_restaurant(email);
  }

  public async check_password(token: string, payload: DtoCheckPassword): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    if (await this.util_service.encode(payload.password) !== found_restaurant.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload) {
    const email: string = await this.util_service.get_email_by_token(token);
    await this.db_service.update_restaurant(email, payload);
  }

  public async load(token: string): Promise<ResLoad> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    return new Restaurant({ ...found_restaurant, menu_category: undefined, id: undefined, password: undefined, email: undefined });
  }
}
