import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Option } from './option.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  public groupId: number;
  @Column()
  public maxCount: number;
  @Column()
  public name: string;
  @ManyToOne(() => Menu, (menu: Menu) => menu.group, { nullable: false })
  @JoinColumn({ name: 'menuId' })
  public menu: Menu;
  @OneToMany(() => Option, (option: Option) => option.group)
  public option: Option[];
}
