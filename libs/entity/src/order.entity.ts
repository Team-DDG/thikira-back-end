import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { EnumOrderStatus, EnumPaymentType } from './enum';

export class OrderDetailOption {
  public name: string;
  public price: number;
}

export class OrderDetailGroup {
  public name: string;
  public option: OrderDetailOption[];
}

export class OrderDetail {
  public name: string;
  public price: number;
  public quantity: number;
  public subPrice: number;
  public group?: OrderDetailGroup[];
}

@Entity()
export class Order {
  @ObjectIdColumn()
  public _id?: ObjectID;
  public orderId: ObjectID;
  @Column()
  public roadAddress: string;
  @Column()
  public address: string;
  @Column()
  public discountAmount: number;
  @Column()
  public nickname: string;
  @Column()
  public orderDetail: OrderDetail[];
  @Column({ enum: EnumOrderStatus, type: 'enum' })
  public status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @Column({ enum: EnumPaymentType, type: 'enum' })
  public paymentType: EnumPaymentType = EnumPaymentType.OFFLINE;
  @Column()
  public phone: string;
  @Column()
  public totalPrice: number;
  @Column()
  public userId: number;
  @Column()
  public restaurantId: number;
}
