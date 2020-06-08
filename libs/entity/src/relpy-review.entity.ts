import { Restaurant, Review } from '@app/entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class ReplyReview {
  @PrimaryColumn()
  public restaurantId: number;
  @Column()
  public content: string;
  @CreateDateColumn()
  public createTime: Date;
  @Column({ nullable: true })
  public editTime?: Date;
  @Column({ default: false })
  public isEdited: boolean;
  @ManyToOne(
    () => Restaurant,
    (restaurant: Restaurant) => restaurant.replyReview,
    { nullable: false })
  @JoinColumn({ name: 'restaurantId' })
  public restaurant: Restaurant;
  @OneToOne(() => Review, (review: Review) => review.replyReview)
  @JoinColumn({ name: 'reviewId' })
  public review: Review;
}
