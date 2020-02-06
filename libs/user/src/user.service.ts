import { DtoCheckEmail, DtoCheckPassword, ResRefresh, ResSignIn, DtoSignIn, TokenTypeEnum, UtilService } from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DtoCreateAccount } from './dto';
import { ResLoad } from './res';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User)
              private readonly user_repo: Repository<User>,
              private readonly util_service: UtilService,
  ) {
  }

  public async find_user_by_id(id: number) {
    return this.user_repo.findOne(id);
  }

  public async find_user_by_email(email: string) {
    return this.user_repo.findOne({ email });
  }

  public async delete_user(email: string): Promise<void> {
    await this.user_repo.delete({ email });
  }

  public async update_user(email: string, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util_service.encode(payload.password);
    }
    await this.user_repo.update({ email }, payload);
  }

  public async insert_user(user: User) {
    await this.user_repo.insert(user);
  }

  public async check_email(payload: DtoCheckEmail): Promise<void> {
    const foundUser = await this.find_user_by_email(payload.email);
    if (foundUser) {
      throw new ConflictException();
    }
  }

  public async sign_up(payload: DtoCreateAccount): Promise<void> {
    await this.insert_user(new User({
      ...payload,
      password: await this.util_service.encode(payload.password),
    }));
  }

  public async sign_in(payload: DtoSignIn): Promise<ResSignIn> {
    const found_user: User = await this.find_user_by_email(payload.email);
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
    await this.delete_user(email);
  }

  public async check_password(token: string, payload: DtoCheckPassword): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_user: User = await this.find_user_by_email(email);
    if (await this.util_service.encode(payload.password) !== found_user.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload) {
    const email: string = await this.util_service.get_email_by_token(token);
    await this.update_user(email, payload);
  }

  public async load(token: string): Promise<ResLoad> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_user: User = await this.find_user_by_email(email);
    return new User({ ...found_user, id: undefined, password: undefined, email: undefined });
  }
}
