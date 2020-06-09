import { AuthService } from '@app/auth';
import { Order, ReplyReview, Restaurant, Review, User } from '@app/entity';
import {
  DtoEditReplyReview,
  DtoEditReview,
  DtoUploadReplyReview,
  DtoUploadReview,
  EnumAccountType,
  ParamRemoveReplyReview,
  ParamRemoveReview,
  ParsedTokenClass,
  QueryCheckReview,
  QueryGetReviewStatistic,
  ResGetReviewList,
  ResGetReviewStatistic,
} from '@app/type';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { ResGetReviewListByRestaurant } from '../../type/src/res/review/get-review-list-by-restaurant.res';
import { ResGetReviewListByUser } from '../../type/src/res/review/get-review-list-by-user.res';

@Injectable()
export class ReviewService {
  @InjectRepository(Order, 'mongodb')
  private readonly order_repo: Repository<Order>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurant_repo: Repository<Restaurant>;
  @InjectRepository(Review, 'mysql')
  private readonly review_repo: Repository<Review>;
  @InjectRepository(ReplyReview, 'mysql')
  private readonly reply_review_repo: Repository<ReplyReview>;
  @InjectRepository(User, 'mysql')
  private readonly user_repo: Repository<User>;
  @Inject()
  private readonly auth_service: AuthService;

  // review {

  public async checkReview(token: string, payload: QueryCheckReview): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_user: User = await this.user_repo.findOne(id);
    if (!found_user) {
      throw new ForbiddenException();
    }
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(parseInt(payload.r_id));
    if (!found_restaurant) {
      throw new NotFoundException();
    }
    const num_of_orders: number = await this.order_repo.count({
      r_id: found_restaurant.r_id, u_id: found_user.u_id,
    });

    if (1 > num_of_orders) {
      throw new ForbiddenException('user haven\'t order by the restaurant');
    }
    const found_review: Review = await this.review_repo.findOne({
      restaurant: found_restaurant, user: found_user,
    });
    if (found_review) {
      throw new ConflictException();
    }
  }

  public async uploadReview(token: string, payload: DtoUploadReview): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_user: User = await this.user_repo.findOne(id);
    if (!found_user) {
      throw new ForbiddenException();
    }

    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(payload.r_id);
    if (!found_restaurant) {
      throw new NotFoundException();
    }

    const review: Review = new Review();
    for (const e of ['r_id']) {
      Reflect.deleteProperty(payload, e);
    }
    Object.assign(review, { ...payload, restaurant: found_restaurant, user: found_user });

    await this.review_repo.insert(review);

    await this.updateRestaurantStar(found_restaurant.r_id);
  }

  public async editReview(token: string, payload: DtoEditReview): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_review: Review = await this.review_repo.findOne({ r_id: payload.r_id, u_id: id });

    if (!found_review) {
      throw new NotFoundException();
    }

    const r_id: number = payload.r_id;

    ['r_id'].map((e: string): void => {
      Reflect.deleteProperty(payload, e);
    });

    await this.review_repo.update({ r_id, u_id: id }, {
      ...payload, edit_time: new Date(), is_edited: true,
    });

    await this.updateRestaurantStar(found_review.r_id);
  }

  public async removeReview(token: string, param: ParamRemoveReview): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_review: Review = await this.review_repo.findOne({
      join: {
        alias: 'Review',
        leftJoinAndSelect: {
          ReplyReview: 'Review.reply_review',
        },
      },
      where: { r_id: param.r_id, u_id: id },
    });

    if (!found_review) {
      throw new NotFoundException();
    }

    if (found_review.reply_review) {
      await this.reply_review_repo.delete({ r_id: found_review.r_id, u_id: found_review.u_id });
    }

    await this.review_repo.delete({ r_id: found_review.r_id, u_id: found_review.u_id });

    await this.updateRestaurantStar(parseInt(param.r_id));
  }

  public async getReviewListByUser(token: string): Promise<ResGetReviewListByUser[]> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    return (await this.getReviewList(id, EnumAccountType.NORMAL))
      .map((e_review: ResGetReviewList): ResGetReviewListByUser => {
        Reflect.deleteProperty(e_review, 'u_id');
        if (e_review.reply_review) {
          Reflect.deleteProperty(e_review.reply_review, 'u_id');
        }
        return e_review;
      });
  }

  public async getReviewListByRestaurant(token: string): Promise<ResGetReviewListByRestaurant[]> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    return (await this.getReviewList(id, EnumAccountType.RESTAURANT))
      .map((e_review: ResGetReviewList): ResGetReviewListByRestaurant => {
        Reflect.deleteProperty(e_review, 'r_id');
        if (e_review.reply_review) {
          Reflect.deleteProperty(e_review.reply_review, 'r_id');
        }
        return e_review;
      });
  }

  public async getReviewStatistic(param: string | QueryGetReviewStatistic): Promise<ResGetReviewStatistic> {
    let found_restaurant: Restaurant;
    if ('string' === typeof param) {
      const { id }: ParsedTokenClass = this.auth_service.parseToken(param);
      found_restaurant = await this.restaurant_repo.findOne(id);
    } else {
      found_restaurant = await this.restaurant_repo.findOne(parseInt(param.r_id));
    }
    const found_reviews: Review[] = await this.review_repo.find({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
      where: { restaurant: found_restaurant },
    });
    if (1 > found_reviews.length) {
      throw new NotFoundException();
    }
    const star: number[] = [];
    let mean: number = 0;
    for (const loop of [0, 1, 2, 3, 4, 5]) {
      star[loop] = 0;
    }
    for (const e_review of found_reviews) {
      star[Math.floor(e_review.star)] += 1;
      mean += e_review.star;
    }

    mean /= found_reviews.length;
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

  // }

  // reply_review {

  public async uploadReplyReview(token: string, payload: DtoUploadReplyReview): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const found_review: Review = await this.review_repo.findOne({ r_id: id, u_id: payload.u_id }, {
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
    });
    if (!found_review) {
      throw new NotFoundException();
    }
    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(id);

    const reply_review: ReplyReview = new ReplyReview();
    Object.assign(reply_review, { ...payload, restaurant: found_restaurant, review: found_review });
    await this.reply_review_repo.insert(reply_review);
  }

  public async editReplyReview(token: string, payload: DtoEditReplyReview): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const foundReplyReview: ReplyReview = await this.reply_review_repo.findOne({
      r_id: id, u_id: payload.u_id,
    });

    if (!foundReplyReview) {
      throw new NotFoundException();
    }

    await this.reply_review_repo.update({ r_id: id, u_id: payload.u_id }, {
      ...payload, edit_time: new Date(), is_edited: true,
    });
  }

  public async removeReplyReview(token: string, param: ParamRemoveReplyReview): Promise<void> {
    const { id }: ParsedTokenClass = this.auth_service.parseToken(token);
    const foundReplyReview: ReplyReview = await this.reply_review_repo.findOne({
      r_id: id, u_id: parseInt(param.u_id),
    });

    if (!foundReplyReview) {
      throw new NotFoundException();
    }

    await this.reply_review_repo.delete({ r_id: id, u_id: parseInt(param.u_id) });
  }

  // }

  private async getReviewList(id: number, user_type: EnumAccountType): Promise<ResGetReviewList[]> {
    const find_option: FindConditions<Review> = {};

    if (user_type === EnumAccountType.NORMAL) {
      find_option.u_id = id;
    } else {
      find_option.r_id = id;
    }

    const found_reviews: Review[] = await this.review_repo.find({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
      where: find_option,
    });
    if (!found_reviews) {
      throw new NotFoundException();
    }
    for (const e_review of found_reviews) {
      if (!e_review.is_edited) {
        Reflect.deleteProperty(e_review, 'edit_time');
      }
      if (e_review.reply_review && !e_review.reply_review.is_edited) {
        Reflect.deleteProperty(e_review.reply_review, 'edit_time');
      }
    }
    return found_reviews;
  }

  private async updateRestaurantStar(r_id: number): Promise<void> {
    const found_reviews: Review[] = await this.review_repo.find({
      select: ['star'],
      where: { restaurant: { r_id } },
    });

    let totalOfStar: number = 0;
    for (const e_review of found_reviews) {
      totalOfStar += e_review.star;
    }

    if (totalOfStar != 0) {
      await this.restaurant_repo.update(r_id, { star: totalOfStar / found_reviews.length });
    }
  }
}
