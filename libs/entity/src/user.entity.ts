import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public userId: number;
  @Column({ nullable: true })
  public roadAddress: string = null;
  @Column({ nullable: true })
  public address: string = null;
  @Column()
  public email: string;
  @Column()
  public phone: string;
  @Column()
  public password: string;
  @Column()
  public nickname: string;
  @CreateDateColumn()
  public createTime: Date;
  @OneToMany(() => Review, (review: Review) => review.user)
  public review: Review[];
}
