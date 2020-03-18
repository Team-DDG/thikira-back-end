import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Menu {
  @Column()
  public description: string;
  @OneToMany(() => Group, (group: Group) => group.menu)
  public group: Group[];
  @Column()
  public image: string;
  @PrimaryGeneratedColumn()
  public m_id: number;
  @ManyToOne(
    () => MenuCategory,
    (menu_category: MenuCategory) => menu_category.menu,
    { nullable: false },
  )
  @JoinColumn({ name: 'mc_id' })
  public menu_category: MenuCategory;
  @Column()
  public name: string;
  @Column()
  public price: number;
}
