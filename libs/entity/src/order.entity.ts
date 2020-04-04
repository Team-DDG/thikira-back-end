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
  public sub_price: number;
  public group?: OrderDetailGroup[];
}

@Entity()
export class Order {
  @ObjectIdColumn()
  public _id: ObjectID;
  public od_id: ObjectID;
  @Column()
  public add_street: string;
  @Column()
  public add_parcel: string;
  @Column()
  public discount_amount: number;
  @Column()
  public nickname: string;
  @Column()
  public order_detail: OrderDetail[];
  @Column({ enum: EnumOrderStatus, type: 'enum' })
  public status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @Column({ enum: EnumPaymentType, type: 'enum' })
  public payment_type: EnumPaymentType = EnumPaymentType.OFFLINE;
  @Column()
  public phone: string;
  @Column()
  public total_price: number;
  @Column()
  public u_id: number;
  @Column()
  public r_id: number;
}
