import { Order, Restaurant, User } from '@app/entity';
import { TokenService } from '@app/token';
import { EnumUserType } from '@app/type';
import { OrderUserClass } from '@app/type/etc';
import { DtoEditOrderStatus, DtoUploadOrder } from '@app/type/req';
import { ResGetOrderList } from '@app/type/res';
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
  private readonly tokenService: TokenService;

  public async upload(token: string, payload: DtoUploadOrder): Promise<void> {
    const id: number = this.tokenService.getIdByToken(token);
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

  public async getListByUser(token: string): Promise<ResGetOrderList[]> {
    const id: number = this.tokenService.getIdByToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    if (!foundUser) {
      throw new ForbiddenException();
    }
    return this.getList(id, EnumUserType.NORMAL);
  }

  public async getListByRestaurant(token: string): Promise<ResGetOrderList[]> {
    const id: number = this.tokenService.getIdByToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    if (!foundRestaurant) {
      throw new ForbiddenException();
    }

    return this.getList(id, EnumUserType.RESTAURANT);
  }

  public async editOrderStatus(payload: DtoEditOrderStatus): Promise<void> {
    await this.orderRepo.update(payload.orderId, payload);
  }

  public async removeOrder(orderId: ObjectID | string): Promise<void> {
    await this.orderRepo.delete(orderId);
  }

  // only use in test

  public async getOrderListByRestaurantUser(restaurantToken: string, userToken: string): Promise<Order[]> {
    let id: number = this.tokenService.getIdByToken(restaurantToken);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    id = this.tokenService.getIdByToken(userToken);
    const foundUser: User = await this.userRepo.findOne(id);

    const foundOrders: Order[] = await this.orderRepo.find({
      restaurantId: foundRestaurant.restaurantId, userId: foundUser.userId,
    });
    for (const elementOrder of foundOrders) {
      elementOrder.orderId = elementOrder._id;
    }
    return foundOrders;
  }

  private async getList(id: number, userType: EnumUserType): Promise<ResGetOrderList[]> {
    const res: ResGetOrderList[] = [];

    const findOption: FindConditions<Order> = {};
    if (userType === EnumUserType.NORMAL) {
      findOption.userId = id;
    } else {
      findOption.restaurantId = id;
    }

    const foundOrders: Order[] = await this.orderRepo.find(findOption);

    if (!foundOrders) {
      throw new NotFoundException();
    }

    for (const elementOrder of foundOrders) {
      elementOrder.orderId = elementOrder._id;
    }

    for (const elementOrder of foundOrders) {
      for (const element of ['_id', 'userId', 'restaurantId']) {
        Reflect.deleteProperty(elementOrder, element);
      }
      res.push({
        ...elementOrder, createTime: elementOrder.orderId.getTimestamp(),
        orderId: elementOrder.orderId.toString(),
      });
    }
    return res;
  }
}
