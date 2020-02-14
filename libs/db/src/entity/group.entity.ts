import { DtoUploadGroup } from '@app/dto';
import { stringify } from "querystring";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Option } from './option.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  public readonly g_id: number;
  @Column()
  public readonly g_name: string;
  @Column()
  public readonly g_max_count: number;
  @ManyToOne(
    (type) => Menu,
    (menu: Menu) => menu.group,
    { nullable: false },
  )
  @JoinColumn({ name: 'm_id' })
  public readonly menu: Menu;
  @OneToMany((type) => Option, (option: Option) => option.group)
  public readonly option: Option[];

  constructor(group?: Group | DtoUploadGroup, param?: Menu) {
    if (group instanceof Group) {
      Object.assign(this, group);
      this.option = new Array<Option>();
    } else if (group !== undefined) {
      if (param instanceof Menu) {
        this.g_name = group.name;
        this.g_max_count = group.max_count;
        this.menu = param;
      }
    }
  }

  public is_empty(): boolean {
    return !this.g_name;
  }

  public get(): string {
    return stringify({
      name: this.g_name,
      max_count: this.g_max_count,
    });
  }
}
