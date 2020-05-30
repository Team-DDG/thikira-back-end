import { Order, User } from '@app/entity';
import { TokenService, TokenTypeEnum } from '@app/token';
import {
  DtoCheckPassword,
  DtoCreateUser,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditUserInfo,
  DtoSignIn,
  QueryCheckEmail,
} from '@app/type/req';
import { ResLoadUser, ResRefresh, ResSignIn } from '@app/type/res';
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
  private readonly tokenService: TokenService;
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
      accessToken: this.tokenService.createToken(foundUser.userId, TokenTypeEnum.access),
      refreshToken: this.tokenService.createToken(foundUser.userId, TokenTypeEnum.refresh),
    };
  }

  public refresh(token: string): ResRefresh {
    const id: number = this.tokenService.getIdByToken(token);
    return { accessToken: this.tokenService.createToken(id, TokenTypeEnum.access) };
  }

  public async checkPassword(token: string, payload: DtoCheckPassword): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
    const foundUser: User = await this.userRepo.findOne(id);

    if (!foundUser || this.utilService.encode(payload.password) !== foundUser.password) {
      throw new ForbiddenException();
    }
  }

  public async edit(token: string, payload: DtoEditUserInfo | DtoEditAddress): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
    await this.userRepo.update(id, payload);
  }

  public async editPassword(token: string, payload: DtoEditPassword): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
    await this.userRepo.update(id, {
      password: this.utilService.encode(payload.password),
    });
  }

  public async load(token: string): Promise<ResLoadUser> {
    const id: number = this.tokenService.getIdByToken(token);
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
    const id: number = this.tokenService.getIdByToken(token);
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
    const id: number = this.tokenService.getIdByToken(token);
    return this.userRepo.findOne(id);
  }
}
