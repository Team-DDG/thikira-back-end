import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  public readonly id: number;
  @Column()
  public readonly name: string;
  @Column()
  public readonly price: number;
  @Column()
  public readonly description: string;
  @Column()
  public readonly image: string;
  @OneToMany((type) => Group, (group: Group) => group.menu)
  public readonly group: Group[];
  @ManyToOne(
    (type) => MenuCategory,
    (menu_category: MenuCategory) => menu_category.menu,
    { nullable: false },
  )
  public readonly menu_category: MenuCategory;

  constructor(menu) {
    Object.assign(this, menu);
  }

  public isEmpty(): boolean {
    return !this.name;
  }
}
