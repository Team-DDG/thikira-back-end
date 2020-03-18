import { DtoEditOrderStatus, DtoUploadOrder } from '@app/type/req';
import { Order, OrderDetail, Restaurant, User } from '@app/db';
import { ResGetOrderListByRestaurant, ResGetOrderListByUser } from '@app/type/res';
import { DBService } from '@app/db';
import { Inject } from '@nestjs/common';
import { ObjectID } from 'typeorm';
import { UtilService } from '@app/util';
import { plainToClass } from 'class-transformer';

export class OrderService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  public async upload(token: string, payload: DtoUploadOrder): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.db_service.find_user_by_email(email);

    const option: Order = new Order();
    option.detail = [];
    Object.assign(option, { ...payload, user: f_user });
    for (const e_m of payload.menu) {
      let sub_price: number = e_m.price;
      if (e_m.group) {
        for (const e_g of e_m.group) {
          for (const e_o of e_g.option) {
            sub_price += e_o.price;
          }
        }
      }
      option.detail.push(plainToClass(OrderDetail, { ...e_m, sub_price }));
    }
    await this.db_service.insert_order(option);
  }

  public async get_list_by_user(token: string): Promise<ResGetOrderListByUser[]> {
    const res: ResGetOrderListByUser[] = [];

    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.db_service.find_user_by_email(email);

    const f_orders: Order[] = await this.db_service.find_orders_by_user(f_user);

    for (const e_od of f_orders) {
      res.push(plainToClass(ResGetOrderListByUser,
        { ...e_od, create_time: e_od.od_id.getTimestamp() }));
    }

    return res;
  }

  public async get_list_by_restaurant(token: string): Promise<ResGetOrderListByRestaurant[]> {
    const res: ResGetOrderListByRestaurant[] = [];

    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);

    const f_orders: Order[] = await this.db_service.find_orders_by_restaurant(f_restaurant);

    for (const e_od of f_orders) {
      res.push(plainToClass(ResGetOrderListByRestaurant,
        { ...e_od, create_time: e_od.od_id.getTimestamp() }));
    }

    return res;
  }

  public async edit_order_status(payload: DtoEditOrderStatus): Promise<void> {
    await this.db_service.update_order(payload.od_id, payload);
  }

  // only use in test

  public async get_order(r_id: number): Promise<Order> {
    return this.db_service.find_order_by_restaurant_id(r_id);
  }

  public async remove_order(od_id: ObjectID): Promise<void> {
    await this.db_service.delete_order(od_id);
  }
}
