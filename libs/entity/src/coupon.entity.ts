import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  public c_id: number;
  @Column()
  public discount_amount: number;
  @Column()
  public expired_day: Date;
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.coupon)
  @JoinColumn({ name: 'r_id' })
  public restaurant: Restaurant;
}
