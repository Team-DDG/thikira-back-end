import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  public readonly id: Number;
  @Column()
  public readonly name: String;
  @Column()
  public readonly price: Number;
  @Column()
  public readonly description: String;
  @Column()
  public readonly image: String;
  @OneToMany((type) => Group, (group: Group) => group.menu)
  public readonly group: Group[];
  @ManyToOne(
    (type) => MenuCategory,
    (menu_category: MenuCategory) => menu_category.menu,
    { nullable: false },
  )
  public readonly menu_category: MenuCategory;

  constructor(restaurant) {
    Object.assign(this, restaurant);
  }

  public isEmpty(): boolean {
    return !this.name;
  }
}
