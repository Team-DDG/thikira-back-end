import { Order, Restaurant, User } from '@app/entity';
import { TokenService } from '@app/token';
import { OrderUserClass } from '@app/type/etc';
import { DtoEditOrderStatus, DtoUploadOrder } from '@app/type/req';
import { ResGetOrderList } from '@app/type/res';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';

export class OrderService {
  @InjectRepository(Order, 'mongodb')
  private readonly od_repo: Repository<Order>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly r_repo: Repository<Restaurant>;
  @InjectRepository(User, 'mysql')
  private readonly u_repo: Repository<User>;
  @Inject()
  private readonly token_service: TokenService;

  public async upload(token: string, payload: DtoUploadOrder): Promise<void> {
    const id: number = this.token_service.get_id_by_token(token);
    const f_user: User = await this.u_repo.findOne(id);
    if (!f_user) {
      throw new ForbiddenException();
    }
    const user_data: OrderUserClass = f_user;
    for (const e of ['email', 'password', 'create_time']) {
      Reflect.deleteProperty(user_data, e);
    }

    const option: Order = new Order();
    Object.assign(option, { ...user_data, order_detail: [], total_price: 0 });
    for (const e_m of payload.menu) {
      let sub_price: number = e_m.price;
      if (e_m.group) {
        for (const e_g of e_m.group) {
          for (const e_o of e_g.option) {
            sub_price += e_o.price;
          }
        }
      }
      sub_price *= e_m.quantity;
      option.total_price += sub_price;
      option.order_detail.push({ ...e_m, sub_price });
    }
    option.total_price -= payload.discount_amount;
    for (const e of ['menu']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(option, payload);
    await this.od_repo.insert(option);
  }

  public async get_list_by_user(token: string): Promise<ResGetOrderList[]> {
    const res: ResGetOrderList[] = [];

    const id: number = this.token_service.get_id_by_token(token);
    const f_user: User = await this.u_repo.findOne(id);
    if (!f_user) {
      throw new ForbiddenException();
    }

    const f_orders: Order[] = await this.od_repo.find({ u_id: f_user.u_id });
    if (!f_orders) {
      throw new NotFoundException();
    }

    for (const e_od of f_orders) {
      e_od.od_id = e_od._id;
    }

    for (const e_od of f_orders) {
      for (const e of ['_id', 'u_id', 'r_id']) {
        Reflect.deleteProperty(e_od, e);
      }
      res.push({
        ...e_od, create_time: e_od.od_id.getTimestamp(),
        od_id: e_od.od_id.toString(),
      });
    }
    return res;
  }

  public async get_list_by_restaurant(token: string): Promise<ResGetOrderList[]> {
    const res: ResGetOrderList[] = [];

    const id: number = this.token_service.get_id_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne(id);
    if (!f_restaurant) {
      throw new ForbiddenException();
    }

    const f_orders: Order[] = await this.od_repo.find({ r_id: f_restaurant.r_id });
    if (!f_orders) {
      throw new NotFoundException();
    }

    for (const e_od of f_orders) {
      e_od.od_id = e_od._id;
    }

    for (const e_od of f_orders) {
      for (const e of ['_id', 'u_id', 'r_id']) {
        Reflect.deleteProperty(e_od, e);
      }
      res.push({
        ...e_od, create_time: e_od.od_id.getTimestamp(),
        od_id: e_od.od_id.toString(),
      });
    }

    return res;
  }

  public async edit_order_status(payload: DtoEditOrderStatus): Promise<void> {
    await this.od_repo.update(payload.od_id, payload);
  }

  // only use in test

  public async remove_order(od_id: ObjectID | string): Promise<void> {
    await this.od_repo.delete(od_id);
  }

  public async get_orders_by_restaurant_user(r_token: string, u_token: string): Promise<Order[]> {
    let id: number = this.token_service.get_id_by_token(r_token);
    const f_restaurant: Restaurant = await this.r_repo.findOne(id);
    id = this.token_service.get_id_by_token(u_token);
    const f_user: User = await this.u_repo.findOne(id);

    const f_orders: Order[] = await this.od_repo.find({ r_id: f_restaurant.r_id, u_id: f_user.u_id });
    for (const e_od of f_orders) {
      e_od.od_id = e_od._id;
    }
    return f_orders;
  }
}
