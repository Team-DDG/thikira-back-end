import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { MenuCategory } from './menu-category.entity';
import { Review } from './review.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  public r_id: number;
  @Column()
  public area: string;
  @Column()
  public road_address: string;
  @Column()
  public address: string;
  @Column()
  public category: string;
  @Column()
  public close_time: string;
  @CreateDateColumn()
  public create_time: Date;
  @Column()
  public day_off: string;
  @Column()
  public description: string;
  @Column()
  public email: string;
  @Column()
  public image: string;
  @Column()
  public min_price: number;
  @Column()
  public name: string;
  @Column()
  public online_payment: boolean;
  @Column()
  public offline_payment: boolean;
  @Column()
  public open_time: string;
  @Column()
  public password: string;
  @Column()
  public phone: string;
  @Column({ nullable: true, type: 'double' })
  public star: number;
  @OneToMany(() => Coupon, (coupon: Coupon) => coupon.restaurant)
  public coupon: Coupon[];
  @OneToMany(() => MenuCategory, (menu_category: MenuCategory) => menu_category.restaurant)
  public menu_category: MenuCategory[];
  @OneToMany(() => Review, (review: Review) => review.restaurant)
  public review: Review[];
}
