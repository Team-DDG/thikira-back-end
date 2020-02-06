import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  public readonly id: number;
  @Column()
  public readonly image: string;
  @Column()
  public readonly name: string;
  @Column()
  public readonly phone: string;
  @Column()
  public readonly add_street: string;
  @Column()
  public readonly add_parcel: string;
  @Column()
  public readonly area: string;
  @Column()
  public readonly category: string;
  @Column()
  public readonly min_price: number;
  @Column()
  public readonly day_off: string;
  @Column()
  public readonly online_payment: boolean;
  @Column()
  public readonly offline_payment: boolean;
  @Column()
  public readonly open_time: string;
  @Column()
  public readonly close_time: string;
  @Column()
  public readonly description: string;
  @Column()
  public readonly email: string;
  @Column()
  public readonly password: string;
  @CreateDateColumn()
  public readonly create_time: Date;
  @OneToMany(
    (type) => MenuCategory,
    (menu_category: MenuCategory) => menu_category.restaurant,
  )
  public readonly menu_category: MenuCategory[];

  constructor(restaurant) {
    Object.assign(this, restaurant);
  }

  public isEmpty(): boolean {
    return !this.email;
  }
}
