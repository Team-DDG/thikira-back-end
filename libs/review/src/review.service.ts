import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DBService, Order, ReplyReview, Restaurant, Review, User } from '@app/db';
import {
  DtoEditReplyReview, DtoEditReview, DtoUploadReplyReview, DtoUploadReview,
  QueryCheckReview, QueryGetReviewStatistic,
} from '@app/type/req';
import { ResGetReviewList, ResGetReviewStatistic } from '@app/type/res';
import { UtilService } from '@app/util';

@Injectable()
export class ReviewService {
  @Inject() private readonly db_service: DBService;
  @Inject() private readonly util_service: UtilService;

  // review

  public async check_review(token: string, payload: QueryCheckReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.db_service.find_user_by_email(email);
    if (!f_user) {
      throw new ForbiddenException();
    }
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_id(parseInt(payload.r_id));
    if (!f_restaurant) {
      throw new NotFoundException();
    }
    const f_order: Order[] = await this.db_service.find_orders_by_restaurant_user(f_restaurant, f_user);

    if (1 > f_order.length) {
      throw new ForbiddenException('user haven\'t order by the restaurant');
    }
    const f_review: Review = await this.db_service.find_review_by_restaurant_user(f_restaurant, f_user);
    if (f_review) {
      throw new ConflictException();
    }
  }

  public async upload_review(token: string, payload: DtoUploadReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.db_service.find_user_by_email(email);
    if (!f_user) {
      throw new ForbiddenException();
    }

    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_id(payload.r_id);
    if (!f_restaurant) {
      throw new NotFoundException();
    }

    const review: Review = new Review();
    for (const e of ['r_id']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(review, { ...payload, restaurant: f_restaurant, user: f_user });
    await this.db_service.insert_review(review);
  }

  public async edit_review(token: string, payload: DtoEditReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_review: Review = await this.db_service.find_review_by_email(email);
    if (!f_review) {
      throw new NotFoundException();
    }
    await this.db_service.update_review(f_review.rv_id, {
      ...payload, edit_time: new Date(), is_edited: true,
    });
  }

  public async remove_review(token: string): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_review: Review = await this.db_service.find_review_by_email(email);
    if (!f_review) {
      throw new NotFoundException();
    }
    if (f_review.reply_review) {
      await this.db_service.delete_reply_review(f_review.reply_review.rr_id);
    }
    await this.db_service.delete_review(f_review.rv_id);
  }

  public async get_review_list_by_user(token: string): Promise<ResGetReviewList[]> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_user: User = await this.db_service.find_user_by_email(email);
    const f_reviews: Review[] = await this.db_service.find_reviews_by_user(f_user);
    if (1 > f_reviews.length) {
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
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    if (!f_restaurant) {
      throw new ForbiddenException();
    }
    const f_reviews: Review[] = await this.db_service.find_reviews_by_restaurant(f_restaurant);
    if (1 > f_reviews.length) {
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
      f_restaurant = await this.db_service.find_restaurant_by_email(email);
    } else {
      f_restaurant = await this.db_service.find_restaurant_by_id(parseInt(param.r_id));
    }
    const f_reviews: Review[] = await this.db_service.find_reviews_by_restaurant(f_restaurant);
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
    const f_review: Review = await this.db_service.find_review_by_id(payload.rv_id);
    if (!f_review) {
      throw new NotFoundException();
    }
    const email: string = this.util_service.get_email_by_token(token);
    const f_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);

    const reply_review: ReplyReview = new ReplyReview();
    Object.assign(reply_review, { ...payload, restaurant: f_restaurant, review: f_review });
    await this.db_service.insert_reply_review(reply_review);
  }

  public async edit_reply_review(token: string, payload: DtoEditReplyReview): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_reply_review: ReplyReview = await this.db_service.find_reply_review_by_email(email);
    if (!f_reply_review) {
      throw new NotFoundException();
    }
    await this.db_service.update_reply_review(f_reply_review.rr_id, {
      ...payload, edit_time: new Date(), is_edited: true,
    });
  }

  public async remove_reply_review(token: string): Promise<void> {
    const email: string = this.util_service.get_email_by_token(token);
    const f_reply_review: ReplyReview = await this.db_service.find_reply_review_by_email(email);
    await this.db_service.delete_reply_review(f_reply_review.rr_id);
  }
}
