import { AuthService, EnumTokenType } from '@app/auth';
import { Order, User } from '@app/entity';
import {
  DtoCheckPassword,
  DtoCreateUser,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditUserInfo,
  DtoSignIn,
  ParsedTokenClass,
  QueryCheckEmail,
  ResLoadUser,
  ResRefresh,
  ResSignIn,
} from '@app/type';
import { UtilService } from '@app/util';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';

@Injectable()
export class UserService {
  @InjectRepository(Order, 'mongodb')
  private readonly order_repo: Repository<Order>;
  @InjectRepository(User, 'mysql')
  private readonly user_repo: Repository<User>;
  @Inject()
  private readonly auth_service: AuthService;
  @Inject()
  private readonly util_service: UtilService;

  public async checkEmail(query: QueryCheckEmail): Promise<void> {
    const found_user: User = await this.user_repo.findOne({ email: query.email });
    if (found_user) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateUser): Promise<void> {
    const found_user: User = await this.user_repo.findOne({ nickname: payload.nickname });
    if (found_user) {
      throw new ConflictException();
    }

    const user: User = new User();
    Object.assign(user, { ...payload, password: this.util_service.encode(payload.password) });
    await this.user_repo.insert(user);
  }

  public async signIn(payload: DtoSignIn): Promise<ResSignIn> {
    const found_user: User = await this.user_repo.findOne({ email: payload.email });
    if (!found_user ||
      found_user.password !== this.util_service.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      access_token: this.auth_service.createToken(found_user.u_id, EnumTokenType.access),
      refresh_token: this.auth_service.createToken(found_user.u_id, EnumTokenType.refresh),
    };
  }

  public refresh(token: string): ResRefresh {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    return { access_token: this.auth_service.createToken(id, EnumTokenType.access) };
  }

  public async checkPassword(token: string, payload: DtoCheckPassword): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_user: User = await this.user_repo.findOne(id);

    if (!found_user || this.util_service.encode(payload.password) !== found_user.password) {
      throw new ForbiddenException();
    }
  }

  public async edit(token: string, payload: DtoEditUserInfo | DtoEditAddress): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    await this.user_repo.update(id, payload);
  }

  public async editPassword(token: string, payload: DtoEditPassword): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    await this.user_repo.update(id, {
      password: this.util_service.encode(payload.password),
    });
  }

  public async load(token: string): Promise<ResLoadUser> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_user: User = await this.user_repo.findOne(id);
    if (!found_user) {
      throw new ForbiddenException();
    }
    for (const e of ['u_id', 'email', 'password']) {
      Reflect.deleteProperty(found_user, e);
    }
    return found_user;
  }

  public async leave(token: string): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_user: User = await this.user_repo.findOne(id);
    if (!found_user) {
      throw new ForbiddenException();
    }

    const found_orders: Order[] = await this.order_repo.find({ u_id: found_user.u_id });

    if (found_orders) {
      const orderIds: ObjectID[] = [];
      for (const e_order of found_orders) {
        orderIds.push(e_order.od_id);
      }
      await this.order_repo.delete(orderIds);
    }
    await this.user_repo.delete(id);
  }

  // use only in test

  public async get(token: string): Promise<User> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    return this.user_repo.findOne(id);
  }
}
