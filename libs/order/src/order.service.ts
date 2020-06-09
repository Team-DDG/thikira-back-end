import { AuthService } from '@app/auth';
import { Order, Restaurant, User } from '@app/entity';
import {
  DtoEditOrderStatus,
  DtoUploadOrder,
  EnumAccountType,
  OrderUserClass,
  ParsedTokenClass,
  ResGetOrderList,
  ResGetOrderListByRestaurant,
  ResGetOrderListByUser,
} from '@app/type';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';
import { FindConditions } from 'typeorm/find-options/FindConditions';

export class OrderService {
  @InjectRepository(Order, 'mongodb')
  private readonly order_repo: Repository<Order>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurant_repo: Repository<Restaurant>;
  @InjectRepository(User, 'mysql')
  private readonly user_repo: Repository<User>;
  @Inject()
  private readonly auth_service: AuthService;

  public async upload(token: string, payload: DtoUploadOrder): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_user: User = await this.user_repo.findOne(id);
    if (!found_user) {
      throw new ForbiddenException();
    }
    const user_data: OrderUserClass = found_user;
    for (const e of ['email', 'password', 'create_time']) {
      Reflect.deleteProperty(user_data, e);
    }

    const option: Order = new Order();
    Object.assign(option, { ...user_data, order_detail: [], total_price: 0 });

    for (const e_menu of payload.menu) {
      let sub_price: number = e_menu.price;
      if (e_menu.group) {
        for (const e_group of e_menu.group) {
          for (const e_option of e_group.option) {
            sub_price += e_option.price;
          }
        }
      }
      sub_price *= e_menu.quantity;
      option.total_price += sub_price;
      option.order_detail.push({ ...e_menu, sub_price });
    }
    option.total_price -= payload.discount_amount;
    for (const e of ['menu']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(option, payload);
    await this.order_repo.insert(option);
  }

  public async getListByUser(token: string): Promise<ResGetOrderListByUser[]> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);

    const found_user: User = await this.user_repo.findOne(id);
    if (!found_user) {
      throw new ForbiddenException();
    }

    return (await this.getList(id, EnumAccountType.NORMAL)).map(
      (e_order: ResGetOrderList): ResGetOrderListByUser => {
        Reflect.deleteProperty(e_order, 'u_id');
        return e_order;
      });
  }

  public async getListByRestaurant(token: string): Promise<ResGetOrderListByRestaurant[]> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);
    if (!found_restaurant) {
      throw new ForbiddenException();
    }

    return (await this.getList(id, EnumAccountType.RESTAURANT)).map(
      (e_order: ResGetOrderList): ResGetOrderListByRestaurant => {
        Reflect.deleteProperty(e_order, 'r_id');
        return e_order;
      });
  }

  public async editOrderStatus(payload: DtoEditOrderStatus): Promise<void> {
    await this.order_repo.update(payload.od_id, payload);
  }

  public async removeOrder(od_id: ObjectID | string): Promise<void> {
    await this.order_repo.delete(od_id);
  }

  // only use in test {

  public async getOrderListByRestaurantUser(restaurant_token: string, userToken: string): Promise<Order[]> {
    const { id: r_id }: ParsedTokenClass = this.auth_service.parseToken(restaurant_token);
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(r_id);
    const { id: u_id }: ParsedTokenClass = this.auth_service.parseToken(userToken);
    const found_user: User = await this.user_repo.findOne(u_id);

    const found_orders: Order[] = await this.order_repo.find({
      r_id: found_restaurant.r_id, u_id: found_user.u_id,
    });
    for (const e_order of found_orders) {
      e_order.od_id = e_order._id;
    }
    return found_orders;
  }

  // }

  private async getList(id: number, user_type: EnumAccountType): Promise<ResGetOrderList[]> {
    const find_option: FindConditions<Order> = {};
    if (user_type === EnumAccountType.NORMAL) {
      find_option.u_id = id;
    } else {
      find_option.r_id = id;
    }

    const found_orders: Order[] = await this.order_repo.find(find_option);

    if (found_orders.length < 1) {
      throw new NotFoundException();
    }

    return found_orders.map((e_order: Order): ResGetOrderList => {
      e_order.od_id = e_order._id;
      Reflect.deleteProperty(e_order, '_id');
      return {
        ...e_order,
        create_time: e_order.od_id.getTimestamp(),
        od_id: e_order.od_id.toString(),
      };
    });
  }
}
