import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DtoEditReplyReview, DtoEditReview, DtoUploadReplyReview, DtoUploadReview,
  QueryCheckReview, QueryGetReviewStatistic,
} from '@app/type/req';
import { Order, ReplyReview, Restaurant, Review, User } from '@app/entity';
import { ResGetReviewList, ResGetReviewStatistic } from '@app/type/res';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilService } from '@app/util';

@Injectable()
export class ReviewService {
  @InjectRepository(Order, 'mongodb')
  private readonly od_repo: Repository<Order>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly r_repo: Repository<Restaurant>;
  @InjectRepository(Review, 'mysql')
  private readonly rv_repo: Repository<Review>;
  @InjectRepository(ReplyReview, 'mysql')
  private readonly rr_repo: Repository<ReplyReview>;
  @InjectRepository(User, 'mysql')
  private readonly u_repo: Repository<User>;
  @Inject()
  private readonly util_service: UtilService;

  // review

  public async check_review(token: string, payload: QueryCheckReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.u_repo.findOne({ email });
    if (!f_user) {
      throw new ForbiddenException();
    }
    const f_restaurant: Restaurant = await this.r_repo.findOne(parseInt(payload.r_id));
    if (!f_restaurant) {
      throw new NotFoundException();
    }
    const f_order: Order[] = await this.od_repo.find({ r_id: f_restaurant.r_id, u_id: f_user.u_id });

    if (1 > f_order.length) {
      throw new ForbiddenException('user haven\'t order by the restaurant');
    }
    const f_review: Review = await this.rv_repo.findOne({ restaurant: f_restaurant, user: f_user });
    if (f_review) {
      throw new ConflictException();
    }
  }

  public async upload_review(token: string, payload: DtoUploadReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.u_repo.findOne({ email });
    if (!f_user) {
      throw new ForbiddenException();
    }

    const f_restaurant: Restaurant = await this.r_repo.findOne(payload.r_id);
    if (!f_restaurant) {
      throw new NotFoundException();
    }

    const review: Review = new Review();
    for (const e of ['r_id']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(review, { ...payload, restaurant: f_restaurant, user: f_user });
    await this.rv_repo.insert(review);
  }

  public async edit_review(token: string, payload: DtoEditReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.u_repo.findOne({ email });
    const f_review: Review = await this.rv_repo.findOne({ user: f_user });
    if (!f_review) {
      throw new NotFoundException();
    }
    await this.rv_repo.update(f_review.rv_id, {
      ...payload, edit_time: new Date(), is_edited: true,
    });
  }

  public async remove_review(token: string): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.u_repo.findOne({ email });
    const f_review: Review = await this.rv_repo.findOne({
      join: {
        alias: 'Review',
        leftJoinAndSelect: {
          ReplyReview: 'Review.reply_review',
        },
      },
      where: { user: f_user },
    });
    if (!f_review) {
      throw new NotFoundException();
    }
    if (f_review.reply_review) {
      await this.rr_repo.delete(f_review.reply_review.rr_id);
    }
    await this.rv_repo.delete(f_review.rv_id);
  }

  public async get_review_list_by_user(token: string): Promise<ResGetReviewList[]> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.u_repo.findOne({ email });
    const f_reviews: Review[] = await this.rv_repo.find({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
      where: { user: f_user },
    });
    if (!f_reviews) {
      throw new NotFoundException();
    }
    for (const e_rv of f_reviews) {
      if (!e_rv.is_edited) {
        Reflect.deleteProperty(e_rv, 'edit_time');
      }
      if (e_rv.reply_review && !e_rv.reply_review.is_edited) {
        Reflect.deleteProperty(e_rv.reply_review, 'edit_time');
      }
    }
    return f_reviews;
  }

  public async get_review_list_by_restaurant(token: string): Promise<ResGetReviewList[]> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email });
    if (!f_restaurant) {
      throw new ForbiddenException();
    }
    const f_reviews: Review[] = await this.rv_repo.find({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
      where: { restaurant: f_restaurant },
    });
    if (!f_reviews) {
      throw new NotFoundException();
    }
    for (const e_rv of f_reviews) {
      if (!e_rv.is_edited) {
        Reflect.deleteProperty(e_rv, 'edit_time');
      }
      if (e_rv.reply_review && !e_rv.reply_review.is_edited) {
        Reflect.deleteProperty(e_rv.reply_review, 'edit_time');
      }
    }
    return f_reviews;
  }

  public async get_review_statistic(param: string | QueryGetReviewStatistic): Promise<ResGetReviewStatistic> {
    let f_restaurant: Restaurant;
    if ('string' === typeof param) {
      const email: string = this.util_service.get_email_by_token(param);
      f_restaurant = await this.r_repo.findOne({ email });
    } else {
      f_restaurant = await this.r_repo.findOne(parseInt(param.r_id));
    }
    const f_reviews: Review[] = await this.rv_repo.find({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
      where: { restaurant: f_restaurant },
    });
    if (1 > f_reviews.length) {
      throw new NotFoundException();
    }
    const star: number[] = [];
    let mean: number = 0;
    for (const loop of [0, 1, 2, 3, 4, 5]) {
      star[loop] = 0;
    }
    for (const loop_review of f_reviews) {
      star[Math.floor(loop_review.star)] += 1;
      mean += loop_review.star;
    }

    mean /= f_reviews.length;
    return {
      five: star[5],
      four: star[4],
      mean: mean,
      one: star[1],
      three: star[3],
      two: star[2],
      zero: star[0],
    };
  }

  // reply_review

  public async upload_reply_review(token: string, payload: DtoUploadReplyReview): Promise<void> {
    const f_review: Review = await this.rv_repo.findOne(payload.rv_id, {
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
    });
    if (!f_review) {
      throw new NotFoundException();
    }
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email });

    const reply_review: ReplyReview = new ReplyReview();
    Object.assign(reply_review, { ...payload, restaurant: f_restaurant, review: f_review });
    await this.rr_repo.insert(reply_review);
  }

  public async edit_reply_review(token: string, payload: DtoEditReplyReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email });
    const f_reply_review: ReplyReview = await this.rr_repo.findOne({ restaurant: f_restaurant });
    if (!f_reply_review) {
      throw new NotFoundException();
    }
    await this.rr_repo.update(f_reply_review.rr_id, {
      ...payload, edit_time: new Date(), is_edited: true,
    });
  }

  public async remove_reply_review(token: string): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.r_repo.findOne({ email });
    const f_reply_review: ReplyReview = await this.rr_repo.findOne({ restaurant: f_restaurant });
    await this.rr_repo.delete(f_reply_review.rr_id);
  }
}
