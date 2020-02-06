import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  public readonly id: Number;
  @Column()
  public readonly name: String;
  @Column()
  public readonly price: Number;
  @ManyToOne((type) => Group, (group: Group) => group.option)
  public readonly group: Group;

  constructor(restaurant) {
    Object.assign(this, restaurant);
  }

  public isEmpty(): boolean {
    return !this.name;
  }
}
