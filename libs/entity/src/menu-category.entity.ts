import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class MenuCategory {
  @PrimaryGeneratedColumn()
  public menuCategoryId: number;
  @Column()
  public name: string;
  @OneToMany(() => Menu, (menu: Menu) => menu.menuCategory)
  public menu: Menu[];
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.menuCategory,
    { nullable: false },
  )
  @JoinColumn({ name: 'restaurantId' })
  public restaurant: Restaurant;
}
