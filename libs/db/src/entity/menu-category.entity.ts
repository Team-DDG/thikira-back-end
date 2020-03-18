import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class MenuCategory {
  @PrimaryGeneratedColumn()
  public mc_id: number;
  @Column()
  public name: string;
  @OneToMany(() => Menu, (menu: Menu) => menu.menu_category)
  public menu: Menu[];
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.menu_category,
    { nullable: false },
  )
  @JoinColumn({ name: 'r_id' })
  public restaurant: Restaurant;
}
