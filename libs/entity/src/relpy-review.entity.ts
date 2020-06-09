import { Review } from '@app/entity';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class ReplyReview {
  @PrimaryColumn()
  public r_id: number;
  @PrimaryColumn()
  public u_id: number;
  @Column()
  public content: string;
  @CreateDateColumn()
  public create_time: Date;
  @Column({ nullable: true })
  public edit_time?: Date;
  @Column({ default: false })
  public is_edited: boolean;
  @OneToOne(() => Review, (review: Review) => review.reply_review)
  @JoinColumn([{
    name: 'u_id',
    referencedColumnName: 'u_id',
  }, {
    name: 'r_id',
    referencedColumnName: 'r_id',
  }])
  public review: Review;
}
