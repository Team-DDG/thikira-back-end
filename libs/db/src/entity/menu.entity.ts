import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  public m_id: number;
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
    (menu_category: MenuCategory) => menu_category.menu,
    { nullable: false },
  )
  @JoinColumn({ name: 'mc_id' })
  public menu_category: MenuCategory;
}
