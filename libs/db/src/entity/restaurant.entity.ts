import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Restaurant {
  @OneToMany(() => Coupon, (coupon: Coupon) => coupon.r)
  public c: Coupon[];
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
  @Column()
  public email: string;
  @PrimaryGeneratedColumn()
  public r_id: number;
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
  public password: string;
  @Column()
  public open_time: string;
  @Column()
  public description: string;
  @Column()
  public image: string;
  @CreateDateColumn()
  public create_time: Date;
  @OneToMany(
    () => MenuCategory,
    (menu_category: MenuCategory) => menu_category.r,
  )
  public mc: MenuCategory[];
}
