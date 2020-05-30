import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  public menuId: number;
  @Column()
  public description: string;
  @Column()
  public image: string;
  @Column()
  public name: string;
  @Column()
  public price: number;
  @OneToMany(() => Group, (group: Group) => group.menu)
  public group: Group[];
  @ManyToOne(
    () => MenuCategory,
    (menuCategory: MenuCategory) => menuCategory.menu,
    { nullable: false },
  )
  @JoinColumn({ name: 'menuCategoryId' })
  public menuCategory: MenuCategory;
}
