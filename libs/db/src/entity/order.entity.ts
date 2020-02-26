import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EnumOrderStatus } from '../enum';
import { User } from './user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public readonly od_id: number;
  @CreateDateColumn()
  public readonly od_create_time: Date;
  @Column()
  public readonly od_total_price: number;
  @Column({
    default: EnumOrderStatus.NOT_PAYMENT,
    enum: EnumOrderStatus,
    type: 'enum',
  })
  public readonly od_status: EnumOrderStatus;
  @Column()
  public readonly od_reduced_price: number;
  @ManyToOne(
    () => User,
    (user: User) => user.order,
    { nullable: false },
  )
  @JoinColumn({ name: 'f_u_id' })
  public readonly user: User;
}
