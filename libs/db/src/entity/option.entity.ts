import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { stringify } from 'querystring';

@Entity()
export class Option {
  @ManyToOne(() => Group, (group: Group) => group.option, { nullable: false })
  @JoinColumn({ name: 'f_g_id' })
  public readonly group: Group;
  @PrimaryGeneratedColumn()
  public readonly o_id: number;
  @Column()
  public readonly o_name: string;
  @Column()
  public readonly o_price: number;

  constructor(option?, param?) {
    if (option instanceof Option) {
      Object.assign(this, option);
    } else if (option !== undefined) {
      if (param instanceof Group) {
        this.group = param;
        this.o_name = option.name;
        this.o_price = option.price;
      } else {
        this.o_id = option.o_id;
        this.o_name = option.o_name;
        this.o_price = option.o_price;
      }
    }
  }

  public is_empty() {
    return !this.o_name;
  }

  public get(): string {
    return stringify({
      name: this.o_name,
      price: this.o_price,
    });
  }
}
