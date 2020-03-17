import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnumOrderStatus } from '../order-status.enum';
import { EnumPaymentType } from '../payment-type.enum';

export class OrderDetailOption {
  @ApiProperty() @IsString()
  public name: string;
  @ApiProperty() @IsNumber()
  public price: number;
}

export class OrderDetailGroup {
  @ApiProperty() @IsString()
  public name: string;
  @ApiProperty({ type: [OrderDetailOption] })
  @IsArray() @IsOptional()
  public o?: OrderDetailOption[];
}

export class OrderDetail {
  @ApiProperty() public name: string;
  @ApiProperty() public price: number;
  @ApiProperty() public quantity: number;
  @ApiProperty() public sub_price: number;
  @ApiProperty({ type: [OrderDetailGroup] })
  public g: OrderDetailGroup[];
}

@Entity()
export class Order {
  @ObjectIdColumn()
  public _id: ObjectID;
  public od_id: ObjectID;
  @Column({ enum: EnumPaymentType, type: 'enum' })
  public payment_type: EnumPaymentType = EnumPaymentType.OFFLINE;
  @Column()
  public discount_amount: number;
  @Column({ enum: EnumOrderStatus, type: 'enum' })
  public status: EnumOrderStatus = EnumOrderStatus.NOT_PAYMENT;
  @Column()
  public total_price: number;
  @Column()
  public u_id: number;
  @Column()
  public r_id: number;
  @Column()
  public detail: OrderDetail[];

  public constructor(order?: Order) {
    Object.assign(this, order);
    this.od_id = this._id;
  }
}
