import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Option } from './option.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  public g_id: number;
  @Column()
  public max_count: number;
  @Column()
  public name: string;
  @ManyToOne(() => Menu, (menu: Menu) => menu.group, { nullable: false })
  @JoinColumn({ name: 'm_id' })
  public menu: Menu;
  @OneToMany(() => Option, (option: Option) => option.group)
  public option: Option[];
}
