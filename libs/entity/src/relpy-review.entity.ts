import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Restaurant, Review } from '@app/entity';

@Entity()
export class ReplyReview {
  @PrimaryGeneratedColumn()
  public rr_id: number;
  @Column()
  public content: string;
  @CreateDateColumn()
  public create_time: Date;
  @Column({ nullable: true })
  public edit_time?: Date;
  @Column({ default: false })
  public is_edited: boolean;
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.reply_review,
    { nullable: false })
  @JoinColumn({ name: 'r_id' })
  public restaurant: Restaurant;
  @OneToOne(() => Review, (review: Review) => review.reply_review)
  @JoinColumn({ name: 'rv_id' })
  public review: Review;
}
