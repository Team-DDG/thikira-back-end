import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  public readonly id: Number;
  @Column()
  public readonly name: String;
  @Column()
  public readonly price: Number;
  @ManyToOne((type) => Menu, (menu: Menu) => menu.option)
  public readonly menu: Menu;

  constructor(restaurant) {
    Object.assign(this, restaurant);
  }

  public isEmpty(): boolean {
    return !this.name;
  }
}
