import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from '@app/db';

@Entity()
export class Coupon {
  @Column()
  public readonly c_expired_day: Date;
  @PrimaryGeneratedColumn()
  public readonly c_id: number;
  @Column()
  public readonly c_discount_amount: number;
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.coupon)
  @JoinColumn({ name: 'f_r_id' })
  public readonly restaurant: Restaurant;

  constructor(coupon?, param?) {
    if (coupon instanceof Coupon) {
      Object.assign(this, coupon);
    } else if (coupon !== undefined) {
      if (param instanceof Restaurant) {
        this.c_expired_day = coupon.expired_day;
        this.c_discount_amount = coupon.discount_amount;
        this.restaurant = param;
      }
    }
  }

  public is_empty(): boolean {
    return !this.c_discount_amount;
  }
}
