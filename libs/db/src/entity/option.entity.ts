import { DtoUploadOption } from '@app/dto';
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
  @JoinColumn({ name: 'g_id' })
  public readonly group: Group;

  constructor(option?: Option | DtoUploadOption, param?: Group) {
    if (option instanceof Option) {
      Object.assign(this, option);
    } else if (option !== undefined) {
      if (param instanceof Group) {
        this.o_name = option.name;
        this.o_price = option.price;
        this.group = param;
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
