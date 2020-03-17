import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Menu {
  @Column()
  public description: string;
  @OneToMany(() => Group, (group: Group) => group.m)
  public g: Group[];
  @Column()
  public image: string;
  @PrimaryGeneratedColumn()
  public m_id: number;
  @ManyToOne(
    () => MenuCategory,
    (menu_category: MenuCategory) => menu_category.m,
    { nullable: false },
  )
  @JoinColumn({ name: 'mc_id' })
  public mc: MenuCategory;
  @Column()
  public name: string;
  @Column()
  public price: number;
}
