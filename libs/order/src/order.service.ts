import { DtoEditOrderStatus, DtoUploadOrder } from '@app/type/req';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Order, Restaurant, User } from '@app/db';
import { DBService } from '@app/db';
import { ObjectID } from 'typeorm';
import { OrderUserClass } from '@app/type/etc';
import { ResGetOrderList } from '@app/type/res';
import { UtilService } from '@app/util';

export class OrderService {
  @Inject()
  private readonly db_service: DBService;
  @Inject()
  private readonly util_service: UtilService;

  public async upload(token: string, payload: DtoUploadOrder): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.db_service.find_user_by_email(email);
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
    await this.db_service.insert_order(option);
  }

  public async get_list_by_user(token: string): Promise<ResGetOrderList[]> {
    const res: ResGetOrderList[] = [];

    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.db_service.find_user_by_email(email);
    if (!f_user) {
      throw new ForbiddenException();
    }

    const f_orders: Order[] = await this.db_service.find_orders_by_user(f_user);
    if (!f_orders) {
      throw new NotFoundException();
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

    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    if (!f_restaurant) {
      throw new ForbiddenException();
    }

    const f_orders: Order[] = await this.db_service.find_orders_by_restaurant(f_restaurant);
    if (1 > f_orders.length) {
      throw new NotFoundException();
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
    await this.db_service.update_order(payload.od_id, payload);
  }

  // only use in test

  public async get_order(od_id: string | ObjectID): Promise<Order> {
    return this.db_service.find_order_by_id(od_id);
  }

  public async remove_order(od_id: ObjectID | string): Promise<void> {
    await this.db_service.delete_order(od_id);
  }

  public async get_orders_by_restaurant_user(r_token: string, u_token: string): Promise<Order[]> {
    let email: string = this.util_service.get_email_by_token(r_token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    email = this.util_service.get_email_by_token(u_token);
    const f_user: User = await this.db_service.find_user_by_email(email);

    return this.db_service.find_orders_by_restaurant_user(f_restaurant, f_user);
  }
}
