import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Coupon {
  @Column()
  public expired_day: Date;
  @PrimaryGeneratedColumn()
  public c_id: number;
  @Column()
  public discount_amount: number;
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.c)
  @JoinColumn({ name: 'r_id' })
  public r: Restaurant;
}
