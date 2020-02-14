import { DtoUploadMenu } from '@app/dto';
import { stringify } from "querystring";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  public readonly m_id: number;
  @Column()
  public readonly m_name: string;
  @Column()
  public readonly m_price: number;
  @Column()
  public readonly m_description: string;
  @Column()
  public readonly m_image: string;
  @OneToMany((type) => Group, (group: Group) => group.menu)
  public readonly group: Group[];
  @ManyToOne(
    (type) => MenuCategory,
    (menu_category: MenuCategory) => menu_category.menu,
    { nullable: false },
  )
  @JoinColumn({ name: 'mc_id' })
  public readonly menu_category: MenuCategory;

  constructor(menu?: Menu | DtoUploadMenu, param?: MenuCategory) {
    if (menu instanceof Menu) {
      Object.assign(this, menu);
      this.group = new Array<Group>();
    } else if (menu !== undefined) {
      if (param instanceof MenuCategory) {
        this.m_name = menu.name;
        this.m_price = menu.price;
        this.m_description = menu.description;
        this.m_image = menu.image;
        this.menu_category = param;
      }
    }
  }

  public is_empty(): boolean {
    return !this.m_name;
  }

  public get(): string {
    return stringify({
      name: this.m_name,
      price: this.m_price,
      description: this.m_description,
      image: this.m_image,
    });
  }
}
