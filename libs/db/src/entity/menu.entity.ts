import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';
import { stringify } from 'querystring';

@Entity()
export class Menu {
  @OneToMany(() => Group, (group: Group) => group.menu)
  public readonly group: Group[];
  @Column()
  public readonly m_description: string;
  @PrimaryGeneratedColumn()
  public readonly m_id: number;
  @Column()
  public readonly m_image: string;
  @Column()
  public readonly m_name: string;
  @Column()
  public readonly m_price: number;
  @ManyToOne(
    () => MenuCategory,
    (menu_category: MenuCategory) => menu_category.menu,
    { nullable: false },
  )
  @JoinColumn({ name: 'f_mc_id' })
  public readonly menu_category: MenuCategory;

  constructor(menu?, param?) {
    if (menu instanceof Menu) {
      Object.assign(this, menu);
      this.group = new Array<Group>();
    } else if (menu !== undefined) {
      if (param instanceof MenuCategory) {
        this.m_description = menu.description;
        this.m_image = menu.image;
        this.m_name = menu.name;
        this.m_price = menu.price;
        this.menu_category = param;
      } else {
        this.group = new Array<Group>();
        this.m_description = menu.m_description;
        this.m_id = menu.m_id;
        this.m_image = menu.m_image;
        this.m_name = menu.m_name;
        this.m_price = menu.m_price;
      }
    }
  }

  public is_empty(): boolean {
    return !this.m_name;
  }

  public get(): string {
    return stringify({
      description: this.m_description,
      image: this.m_image,
      name: this.m_name,
      price: this.m_price,
    });
  }
}
