import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Option {
  @ManyToOne(() => Group, (group: Group) => group.o, { nullable: false })
  @JoinColumn({ name: 'g_id' })
  public g: Group;
  @PrimaryGeneratedColumn()
  public o_id: number;
  @Column()
  public name: string;
  @Column()
  public price: number;
}
