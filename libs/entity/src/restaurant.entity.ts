import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { MenuCategory } from './menu-category.entity';
import { ReplyReview } from './relpy-review.entity';
import { Review } from './review.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  public restaurantId: number;
  @Column()
  public area: string;
  @Column()
  public addStreet: string;
  @Column()
  public addParcel: string;
  @Column()
  public category: string;
  @Column()
  public closeTime: string;
  @CreateDateColumn()
  public createTime: Date;
  @Column()
  public description: string;
  @Column()
  public email: string;
  @Column()
  public name: string;
  @Column()
  public phone: string;
  @Column()
  public minPrice: number;
  @Column()
  public dayOff: string;
  @Column()
  public onlinePayment: boolean;
  @Column()
  public offlinePayment: boolean;
  @Column()
  public openTime: string;
  @Column()
  public password: string;
  @Column()
  public image: string;
  @OneToMany(() => Coupon, (coupon: Coupon) => coupon.restaurant)
  public coupon: Coupon[];
  @OneToMany(() => MenuCategory, (menuCategory: MenuCategory) => menuCategory.restaurant)
  public menuCategory: MenuCategory[];
  @OneToMany(() => ReplyReview, (replyReview: ReplyReview) => replyReview.restaurant)
  public replyReview: MenuCategory[];
  @OneToMany(() => Review, (review: Review) => review.restaurant)
  public review: Review[];
}
