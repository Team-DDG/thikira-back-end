import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  public optionId: number;
  @Column()
  public name: string;
  @Column()
  public price: number;
  @ManyToOne(() => Group, (group: Group) => group.option, { nullable: false })
  @JoinColumn({ name: 'groupId' })
  public group: Group;
}
