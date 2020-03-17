import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class MenuCategory {
  @PrimaryGeneratedColumn()
  public mc_id: number;
  @Column()
  public name: string;
  @OneToMany(() => Menu, (menu: Menu) => menu.mc)
  public m: Menu[];
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.mc,
    { nullable: false },
  )
  @JoinColumn({ name: 'r_id' })
  public r: Restaurant;
}
