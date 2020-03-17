import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DtoCheckPassword, DtoCreateUser, DtoEditAddress, DtoEditPassword, DtoEditUserInfo, DtoSignIn, QueryCheckEmail } from '@app/type/req';
import { Order, User } from '@app/db';
import { ResLoadUser, ResRefresh, ResSignIn } from '@app/type/res';
import { TokenTypeEnum, UtilService } from '@app/util';
import { DBService } from '@app/db';
import { ObjectID } from 'typeorm';

@Injectable()
export class UserService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  public async check_email(query: QueryCheckEmail): Promise<void> {
    const f_u: User = await this.db_service.find_user_by_email(query.email);
    if (f_u) {
      throw new ConflictException();
    }
  }

  public async create(payload: DtoCreateUser): Promise<void> {
    const f_u: User = await this.db_service.find_user_by_nickname(payload.nickname);
    if (f_u) {
      throw new ConflictException();
    }

    const user: User = new User();
    Object.assign(user, payload);
    await this.db_service.insert_user(user);
  }

  public async sign_in(payload: DtoSignIn): Promise<ResSignIn> {
    const f_u: User = await this.db_service.find_user_by_email(payload.email);
    if (!f_u ||
      f_u.password !== this.util_service.encode(payload.password)) {
      throw new NotFoundException();
    }

    return {
      access_token: this.util_service.create_token(payload.email, TokenTypeEnum.access),
      refresh_token: this.util_service.create_token(payload.email, TokenTypeEnum.refresh),
    };
  }

  public refresh(token: string): ResRefresh {
    const email: string = this.util_service.get_email_by_token(token);
    return { access_token: this.util_service.create_token(email, TokenTypeEnum.access) };
  }

  public async leave(token: string): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_u: User = await this.db_service.find_user_by_email(email);

    const f_od_list: Order[] = await this.db_service.find_orders_by_user(f_u);
    const od_ids: ObjectID[] = [];
    for (const e_od of f_od_list) {
      od_ids.push(e_od.od_id);
    }
    await this.db_service.delete_order(od_ids);
    await this.db_service.delete_user(email);
  }

  public async check_password(token: string, payload: DtoCheckPassword): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_u: User = await this.db_service.find_user_by_email(email);
    if (this.util_service.encode(payload.password) !== f_u.password) {
      throw new UnauthorizedException();
    }
  }

  public async edit(token: string, payload: DtoEditPassword | DtoEditUserInfo | DtoEditAddress): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    await this.db_service.update_user(email, payload);
  }

  public async get(token: string): Promise<ResLoadUser> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_u: User = await this.db_service.find_user_by_email(email);
    ['u_id', 'email', 'password'].map((e) => {
      Reflect.deleteProperty(f_u, e);
    });
    return f_u;
  }
}
