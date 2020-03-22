import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { MenuCategory } from './menu-category.entity';
import { ReplyReview } from './relpy-review.entity';
import { Review } from './review.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  public r_id: number;
  @Column()
  public area: string;
  @Column()
  public add_street: string;
  @Column()
  public add_parcel: string;
  @Column()
  public category: string;
  @Column()
  public close_time: string;
  @CreateDateColumn()
  public create_time: Date;
  @Column()
  public description: string;
  @Column()
  public email: string;
  @Column()
  public name: string;
  @Column()
  public phone: string;
  @Column()
  public min_price: number;
  @Column()
  public day_off: string;
  @Column()
  public online_payment: boolean;
  @Column()
  public offline_payment: boolean;
  @Column()
  public open_time: string;
  @Column()
  public password: string;
  @Column()
  public image: string;
  @OneToMany(() => Coupon, (coupon: Coupon) => coupon.restaurant)
  public coupon: Coupon[];
  @OneToMany(() => MenuCategory, (menu_category: MenuCategory) => menu_category.restaurant)
  public menu_category: MenuCategory[];
  @OneToMany(() => ReplyReview, (reply_review: ReplyReview) => reply_review.restaurant)
  public reply_review: MenuCategory[];
  @OneToMany(() => Review, (review: Review) => review.restaurant)
  public review: Review[];
}
