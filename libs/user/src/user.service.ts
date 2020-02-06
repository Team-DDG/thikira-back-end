import { DBService, User } from '@app/db';
import { DtoCheckEmail, DtoCheckPassword, ResRefresh, ResSignIn, DtoSignIn, TokenTypeEnum, UtilService } from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DtoCreateAccount } from './dto';
import { ResLoad } from './res';

@Injectable()
export class UserService {
  constructor(private readonly db_service: DBService,
              private readonly util_service: UtilService,
  ) {
  }

  public async check_email(payload: DtoCheckEmail): Promise<void> {
    const foundUser = await this.db_service.find_user_by_email(payload.email);
    if (foundUser) {
      throw new ConflictException();
    }
  }

  public async create_account(payload: DtoCreateAccount): Promise<void> {
    await this.db_service.insert_user(new User({
      ...payload,
      password: await this.util_service.encode(payload.password),
    }));
  }

  public async sign_in(payload: DtoSignIn): Promise<ResSignIn> {
    const found_user: User = await this.db_service.find_user_by_email(payload.email);
    if (found_user.isEmpty() ||
      found_user.password !== await this.util_service.encode(payload.password)) {
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
    await this.db_service.delete_user(email);
  }

  public async check_password(token: string, payload: DtoCheckPassword): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_user: User = await this.db_service.find_user_by_email(email);
    if (await this.util_service.encode(payload.password) !== found_user.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload) {
    const email: string = await this.util_service.get_email_by_token(token);
    await this.db_service.update_user(email, payload);
  }

  public async load(token: string): Promise<ResLoad> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_user: User = await this.db_service.find_user_by_email(email);
    return new User({ ...found_user, id: undefined, password: undefined, email: undefined });
  }
}
