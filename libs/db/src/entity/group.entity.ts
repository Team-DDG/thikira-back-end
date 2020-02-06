import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Option } from './option.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  public readonly id: number;
  @Column()
  public readonly name: string;
  @Column()
  public readonly max_num: number;
  @ManyToOne((type) => Menu, (menu: Menu) => menu.group)
  public readonly menu: Menu;
  @OneToMany((type) => Option, (option: Option) => option.group)
  public readonly option: Option[];

  constructor(group) {
    Object.assign(this, group);
  }

  public isEmpty(): boolean {
    return !this.name;
  }
}
