import {
  Column, CreateDateColumn, Entity,
  JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReplyReview, Restaurant, User } from '@app/db';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  public rv_id: number;
  @Column()
  public content: string;
  @CreateDateColumn()
  public create_time: Date;
  @Column({ nullable: true })
  public edit_time?: Date;
  @Column({ nullable: true })
  public image?: string;
  @Column({ default: false })
  public is_edited: boolean;
  @Column({ type: 'float' })
  public star: number;
  @OneToOne(() => ReplyReview,
    (reply_review: ReplyReview) => reply_review.review,
    { nullable: true },
  )
  public reply_review?: ReplyReview;
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.review,
    { nullable: false })
  @JoinColumn({ name: 'r_id' })
  public restaurant: Restaurant;
  @ManyToOne(
    () => User,
    (user: User) => user.review,
    { nullable: false })
  @JoinColumn({ name: 'u_id' })
  public user: User;
}
