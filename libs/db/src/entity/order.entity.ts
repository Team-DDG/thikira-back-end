import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { EnumOrderStatus, EnumPaymentType } from '../enum';
import { OrderDetailClass, OrderDetailGroupClass, OrderDetailOptionClass } from '../class';
import { User } from './user.entity';

@Entity()
export class Order {
  @ObjectIdColumn()
  public readonly _id: ObjectID;
  @Column({ enum: EnumPaymentType, type: 'enum' })
  public readonly od_payment_type: EnumPaymentType = EnumPaymentType.OFFLINE;
  @Column()
  public readonly od_discount_amount: number;
  @Column({ enum: EnumOrderStatus, type: 'enum' })
  public readonly od_status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @Column()
  public readonly od_total_price: number;
  @Column()
  public readonly f_u_id: number;
  @Column()
  public readonly f_r_id: number;
  @Column()
  public readonly od_detail: OrderDetailClass[];

  constructor(order?, param?) {
    if (order instanceof Order) {
      Object.assign(this, order);
      this.od_status = order.od_status;
    } else {
      if (param instanceof User) {
        this.od_total_price = -(order.discount_amount);
        this.f_r_id = order.r_id;
        this.od_payment_type = order.payment_type;
        this.od_detail = new Array<OrderDetailClass>();
        for (const loop_menu of order.menu) {
          let sub_price = loop_menu.price;
          const order_detail_groups: OrderDetailGroupClass[] = new Array<OrderDetailGroupClass>();
          if (loop_menu.group !== undefined) {
            for (const loop_group of loop_menu.group) {
              const order_detail_group: OrderDetailGroupClass = new OrderDetailGroupClass(loop_group);
              order_detail_groups.push(order_detail_group);
              for (const loop_option of loop_group.option) {
                const order_detail_option: OrderDetailOptionClass = new OrderDetailOptionClass(loop_option);
                order_detail_group.option.push(order_detail_option);
                sub_price += order_detail_option.price;
              }
            }
          }
          sub_price *= loop_menu.quantity;
          const order_detail: OrderDetailClass = new OrderDetailClass({ ...loop_menu, sub_price });
          for (const loop_order_detail_group of order_detail_groups) {
            order_detail.group.push(loop_order_detail_group);
          }
          this.od_detail.push(order_detail);
          this.od_total_price += sub_price;
        }
        this.f_u_id = param.u_id;
      }
    }
  }
}
