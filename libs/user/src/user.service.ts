import { CheckEmailDto, CheckPasswordDto, ResRefresh, ResSignIn, SignInDto, TokenTypeEnum, UtilService } from '@app/util';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto';
import { ResLoad } from './res';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User)
              private readonly users: Repository<User>,
              private readonly util: UtilService,
  ) {
  }

  private async find_user_by_id(id: number) {
    return this.users.findOne(id);
  }

  private async find_user_by_email(email: string) {
    return this.users.findOne({ email });
  }

  private async delete_user(email: string): Promise<void> {
    await this.users.delete({ email });
  }

  private async update_user(email: string, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util.encode(payload.password);
    }
    await this.users.update({ email }, payload);
  }

  private async insert_user(user: User) {
    await this.users.insert(user);
  }

  public async check_email(payload: CheckEmailDto): Promise<void> {
    const foundUser = await this.find_user_by_email(payload.email);
    if (foundUser) {
      throw new ConflictException();
    }
  }

  public async sign_up(payload: SignUpDto): Promise<void> {
    await this.insert_user(new User({
      ...payload,
      password: await this.util.encode(payload.password),
    }));
  }

  public async sign_in(payload: SignInDto): Promise<ResSignIn> {
    const found_user: User = await this.find_user_by_email(payload.email);
    if (found_user.isEmpty() ||
      found_user.password !== await this.util.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      accessToken: await this.util.create_token(payload.email, TokenTypeEnum.access),
      refreshToken: await this.util.create_token(payload.email, TokenTypeEnum.refresh),
    };
  }

  public async refresh(token: string): Promise<ResRefresh> {
    const email: string = await this.util.get_email_by_token(token);
    return { accessToken: await this.util.create_token(email, TokenTypeEnum.access) };
  }

  public async leave(token: string): Promise<void> {
    const email: string = await this.util.get_email_by_token(token);
    await this.delete_user(email);
  }

  public async check_password(token: string, payload: CheckPasswordDto): Promise<void> {
    const email: string = await this.util.get_email_by_token(token);
    const found_user: User = await this.find_user_by_email(email);
    if (await this.util.encode(payload.password) !== found_user.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload) {
    const email: string = await this.util.get_email_by_token(token);
    await this.update_user(email, payload);
  }

  public async load(token: string): Promise<ResLoad> {
    const email: string = await this.util.get_email_by_token(token);
    const found_user: User = await this.find_user_by_email(email);
    return new User({ ...found_user, id: undefined, password: undefined, email: undefined });
  }
}
