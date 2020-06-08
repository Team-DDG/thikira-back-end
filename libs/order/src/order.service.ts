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
  private readonly orderRepo: Repository<Order>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurantRepo: Repository<Restaurant>;
  @InjectRepository(User, 'mysql')
  private readonly userRepo: Repository<User>;
  @Inject()
  private readonly tokenService: AuthService;

  public async upload(token: string, payload: DtoUploadOrder): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    if (!foundUser) {
      throw new ForbiddenException();
    }
    const userData: OrderUserClass = foundUser;
    for (const element of ['email', 'password', 'createTime']) {
      Reflect.deleteProperty(userData, element);
    }

    const option: Order = new Order();
    Object.assign(option, { ...userData, orderDetail: [], totalPrice: 0 });
    for (const elementMenu of payload.menu) {
      let subPrice: number = elementMenu.price;
      if (elementMenu.group) {
        for (const elementGroup of elementMenu.group) {
          for (const elementOption of elementGroup.option) {
            subPrice += elementOption.price;
          }
        }
      }
      subPrice *= elementMenu.quantity;
      option.totalPrice += subPrice;
      option.orderDetail.push({ ...elementMenu, subPrice });
    }
    option.totalPrice -= payload.discountAmount;
    for (const element of ['menu']) {
      Reflect.deleteProperty(payload, element);
    }
    Object.assign(option, payload);
    await this.orderRepo.insert(option);
  }

  public async getListByUser(token: string): Promise<ResGetOrderListByUser[]> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    if (!foundUser) {
      throw new ForbiddenException();
    }

    return (await this.getList(id, EnumAccountType.NORMAL)).map(
      (elementOrder: ResGetOrderList): ResGetOrderListByUser => {
        Reflect.deleteProperty(elementOrder, 'userId');
        return elementOrder;
      });
  }

  public async getListByRestaurant(token: string): Promise<ResGetOrderListByRestaurant[]> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    if (!foundRestaurant) {
      throw new ForbiddenException();
    }

    return (await this.getList(id, EnumAccountType.RESTAURANT)).map(
      (elementOrder: ResGetOrderList): ResGetOrderListByRestaurant => {
        Reflect.deleteProperty(elementOrder, 'restaurantId');
        return elementOrder;
      });
  }

  public async editOrderStatus(payload: DtoEditOrderStatus): Promise<void> {
    await this.orderRepo.update(payload.orderId, payload);
  }

  public async removeOrder(orderId: ObjectID | string): Promise<void> {
    await this.orderRepo.delete(orderId);
  }

  // only use in test {

  public async getOrderListByRestaurantUser(restaurantToken: string, userToken: string): Promise<Order[]> {
    let { id }: ParsedTokenClass = this.tokenService.parseToken(restaurantToken);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    ({ id } = this.tokenService.parseToken(userToken));
    const foundUser: User = await this.userRepo.findOne(id);

    const foundOrders: Order[] = await this.orderRepo.find({
      restaurantId: foundRestaurant.restaurantId, userId: foundUser.userId,
    });
    for (const elementOrder of foundOrders) {
      elementOrder.orderId = elementOrder._id;
    }
    return foundOrders;
  }

  // }

  private async getList(id: number, userType: EnumAccountType): Promise<ResGetOrderList[]> {
    const findOption: FindConditions<Order> = {};
    if (userType === EnumAccountType.NORMAL) {
      findOption.userId = id;
    } else {
      findOption.restaurantId = id;
    }

    const foundOrders: Order[] = await this.orderRepo.find(findOption);

    if (foundOrders.length < 1) {
      throw new NotFoundException();
    }

    return foundOrders.map((elementOrder: Order): ResGetOrderList => {
      elementOrder.orderId = elementOrder._id;
      Reflect.deleteProperty(elementOrder, '_id');
      return {
        ...elementOrder,
        createTime: elementOrder.orderId.getTimestamp(),
        orderId: elementOrder.orderId.toString(),
      };
    });
  }
}
