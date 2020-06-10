import { BaseAccountClass } from '@app/type';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';

@Entity()
export class User extends BaseAccountClass {
  @PrimaryGeneratedColumn()
  public u_id: number;
  @Column()
  public phone: string;
  @Column()
  public nickname: string;
  @OneToMany(() => Review, (review: Review) => review.user)
  public review: Review[];
}
