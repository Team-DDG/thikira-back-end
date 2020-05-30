import { ReplyReview, Restaurant, User } from '@app/entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  public reviewId: number;
  @Column()
  public content: string;
  @CreateDateColumn()
  public createTime: Date;
  @Column({ nullable: true })
  public editTime?: Date;
  @Column({ nullable: true })
  public image?: string;
  @Column({ default: false })
  public isEdited: boolean;
  @Column({ type: 'float' })
  public star: number;
  @OneToOne(() => ReplyReview,
    (replyReview: ReplyReview) => replyReview.review,
    { nullable: true },
  )
  public replyReview?: ReplyReview;
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.review,
    { nullable: false })
  @JoinColumn({ name: 'restaurantId' })
  public restaurant: Restaurant;
  @ManyToOne(
    () => User,
    (user: User) => user.review,
    { nullable: false })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
