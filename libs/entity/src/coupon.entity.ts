import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  public couponId: number;
  @Column()
  public discountAmount: number;
  @Column()
  public expiredDay: Date;
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.coupon,
    { nullable: false },
  )
  @JoinColumn({ name: 'restaurantId' })
  public restaurant: Restaurant;
}
