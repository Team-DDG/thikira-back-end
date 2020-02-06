import { Restaurant } from '@app/restaurant';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';

@Entity()
export class MenuCategory {
  @PrimaryGeneratedColumn()
  public readonly id: number;
  @Column()
  public readonly name: string;
  @OneToMany((type) => Menu, (menu: Menu) => menu.menu_category)
  public readonly menu: Menu[];
  @ManyToOne((type) => Restaurant, (restaurant: Restaurant) => restaurant.menu_category)
  public readonly restaurant: Restaurant;

  constructor(menu_category) {
    Object.assign(this, menu_category);
  }

  public isEmpty(): boolean {
    return !this.name;
  }
}
