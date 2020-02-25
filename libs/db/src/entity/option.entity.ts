import { DtoUploadOption } from '@app/req';
import { stringify } from "querystring";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  public readonly o_id: number;
  @Column()
  public readonly o_name: string;
  @Column()
  public readonly o_price: number;
  @ManyToOne(
    (type) => Group,
    (group: Group) => group.option,
    { nullable: false },
  )
  @JoinColumn({ name: 'f_g_id' })
  public readonly group: Group;

  constructor(option?: Option | DtoUploadOption | any, param?: Group) {
    if (option instanceof Option) {
      Object.assign(this, option);
    } else if (option !== undefined) {
      if (param instanceof Group) {
        this.o_name = option.name;
        this.o_price = option.price;
        this.group = param;
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
