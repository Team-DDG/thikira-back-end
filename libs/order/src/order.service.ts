import { DBService, EnumPaymentType, Order, Restaurant, User } from '@app/db';
import { DtoEditOrderStatus, DtoUploadOrder } from '@app/req';
import { ResGetOrderListByRestaurant, ResGetOrderListByUser } from '@app/res';
import { Inject } from '@nestjs/common';
import { ObjectID } from 'typeorm';
import { UtilService } from '@app/util';

export class OrderService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  public async upload(token: string, payload: DtoUploadOrder) {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_user: User = await this.db_service.find_user_by_email(email);

    await this.db_service.insert_order(new Order(payload, found_user));
  }

  public async get_list_by_user(token: string): Promise<ResGetOrderListByUser[]> {
    const result: ResGetOrderListByUser[] = new Array<ResGetOrderListByUser>();

    const email: string = await this.util_service.get_email_by_token(token);
    const found_user: User = await this.db_service.find_user_by_email(email);

    const found_orders: Order[] = await this.db_service.find_orders_by_user(found_user);

    for (const loop_order of found_orders) {
      result.push(new ResGetOrderListByUser(loop_order));
    }

    return result;
  }

  public async get_list_by_restaurant(token: string): Promise<ResGetOrderListByRestaurant[]> {
    const result: ResGetOrderListByRestaurant[] = new Array<ResGetOrderListByRestaurant>();

    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);

    const found_orders: Order[] = await this.db_service.find_orders_by_restaurant(found_restaurant);

    for (const loop_order of found_orders) {
      result.push(new ResGetOrderListByRestaurant(loop_order));
    }

    return result;
  }

  public async edit_order_status(payload: DtoEditOrderStatus): Promise<void> {
    await this.db_service.update_order(payload.od_id, { od_status: payload.status });
  }

  // only use in test

  public async get_order(payment_type: EnumPaymentType): Promise<Order> {
    return this.db_service.find_order_by_payment_type(payment_type);
  }

  public async remove_order(od_id: ObjectID): Promise<void> {
    await this.db_service.delete_order(od_id);
  }
}
