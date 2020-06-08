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
  private readonly orderRepo: Repository<Order>;
  @InjectRepository(User, 'mysql')
  private readonly userRepo: Repository<User>;
  @Inject()
  private readonly tokenService: AuthService;
  @Inject()
  private readonly utilService: UtilService;

  public async checkEmail(query: QueryCheckEmail): Promise<void> {
    const foundUser: User = await this.userRepo.findOne({ email: query.email });
    if (foundUser) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateUser): Promise<void> {
    const foundUser: User = await this.userRepo.findOne({ nickname: payload.nickname });
    if (foundUser) {
      throw new ConflictException();
    }

    const user: User = new User();
    Object.assign(user, { ...payload, password: this.utilService.encode(payload.password) });
    await this.userRepo.insert(user);
  }

  public async signIn(payload: DtoSignIn): Promise<ResSignIn> {
    const foundUser: User = await this.userRepo.findOne({ email: payload.email });
    if (!foundUser ||
      foundUser.password !== this.utilService.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      accessToken: this.tokenService.createToken(foundUser.userId, EnumTokenType.access),
      refreshToken: this.tokenService.createToken(foundUser.userId, EnumTokenType.refresh),
    };
  }

  public refresh(token: string): ResRefresh {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    return { accessToken: this.tokenService.createToken(id, EnumTokenType.access) };
  }

  public async checkPassword(token: string, payload: DtoCheckPassword): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);

    if (!foundUser || this.utilService.encode(payload.password) !== foundUser.password) {
      throw new ForbiddenException();
    }
  }

  public async edit(token: string, payload: DtoEditUserInfo | DtoEditAddress): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    await this.userRepo.update(id, payload);
  }

  public async editPassword(token: string, payload: DtoEditPassword): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    await this.userRepo.update(id, {
      password: this.utilService.encode(payload.password),
    });
  }

  public async load(token: string): Promise<ResLoadUser> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    if (!foundUser) {
      throw new ForbiddenException();
    }
    for (const element of ['userId', 'email', 'password']) {
      Reflect.deleteProperty(foundUser, element);
    }
    return foundUser;
  }

  public async leave(token: string): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    if (!foundUser) {
      throw new ForbiddenException();
    }

    const foundOrders: Order[] = await this.orderRepo.find({ userId: foundUser.userId });

    if (foundOrders) {
      const orderIds: ObjectID[] = [];
      for (const elementOrder of foundOrders) {
        orderIds.push(elementOrder.orderId);
      }
      await this.orderRepo.delete(orderIds);
    }
    await this.userRepo.delete(id);
  }

  // use only in test

  public async get(token: string): Promise<User> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    return this.userRepo.findOne(id);
  }
}
