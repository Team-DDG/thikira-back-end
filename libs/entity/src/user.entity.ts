import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public u_id: number;
  @Column({ nullable: true })
  public road_address: string = null;
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
  public create_time: Date;
  @OneToMany(() => Review, (review: Review) => review.user)
  public review: Review[];
}
