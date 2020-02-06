import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  public readonly id: number;
  @Column()
  public readonly name: string;
  @Column()
  public readonly price: number;
  @ManyToOne((type) => Group, (group: Group) => group.option)
  public readonly group: Group;

  constructor(option) {
    Object.assign(this, option);
  }

  public isEmpty(): boolean {
    return !this.name;
  }
}
