import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { MenuCategory } from './menu-category.entity';
import { stringify } from 'querystring';

@Entity()
export class Restaurant {
  @OneToMany(() => Coupon, (coupon: Coupon) => coupon.restaurant)
  public readonly coupon: Coupon[];
  @Column()
  public readonly r_area: string;
  @Column()
  public readonly r_add_street: string;
  @Column()
  public readonly r_add_parcel: string;
  @Column()
  public readonly r_category: string;
  @Column()
  public readonly r_close_time: string;
  @Column()
  public readonly r_email: string;
  @PrimaryGeneratedColumn()
  public readonly r_id: number;
  @Column()
  public readonly r_name: string;
  @Column()
  public readonly r_phone: string;
  @Column()
  public readonly r_min_price: number;
  @Column()
  public readonly r_day_off: string;
  @Column()
  public readonly r_online_payment: boolean;
  @Column()
  public readonly r_offline_payment: boolean;
  @Column()
  public readonly r_password: string;
  @Column()
  public readonly r_open_time: string;
  @Column()
  public readonly r_description: string;
  @Column()
  public readonly r_image: string;
  @CreateDateColumn()
  public readonly r_create_time: Date;
  @OneToMany(
    () => MenuCategory,
    (menu_category: MenuCategory) => menu_category.restaurant,
  )
  public readonly menu_category: MenuCategory[];

  constructor(restaurant?) {
    if (restaurant !== undefined) {
      if (restaurant instanceof Restaurant) {
        Object.assign(this, restaurant);
      } else {
        this.r_area = restaurant.area;
        this.r_add_street = restaurant.add_street;
        this.r_add_parcel = restaurant.add_parcel;
        this.r_category = restaurant.category;
        this.r_close_time = restaurant.close_time;
        this.r_day_off = restaurant.day_off;
        this.r_description = restaurant.description;
        this.r_email = restaurant.email;
        this.r_image = restaurant.image;
        this.r_min_price = restaurant.min_price;
        this.r_name = restaurant.name;
        this.r_online_payment = restaurant.online_payment;
        this.r_offline_payment = restaurant.offline_payment;
        this.r_open_time = restaurant.open_time;
        this.r_password = restaurant.password;
        this.r_phone = restaurant.phone;
      }
    }
  }

  public is_empty(): boolean {
    return !this.r_email;
  }

  public get_info(): string {
    return stringify({
      area: this.r_area,
      close_time: this.r_close_time,
      day_off: this.r_day_off,
      description: this.r_description,
      image: this.r_image,
      min_price: this.r_min_price,
      name: this.r_name,
      offline_payment: this.r_offline_payment,
      online_payment: this.r_online_payment,
      open_time: this.r_open_time,
      phone: this.r_phone,
    });
  }

  public get_address(): string {
    return stringify({
      add_parcel: this.r_add_parcel,
      add_street: this.r_add_street,
    });
  }
}
