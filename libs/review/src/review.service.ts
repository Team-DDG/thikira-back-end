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
  QueryCheckReview,
  QueryGetReviewStatistic,
  ResGetReviewList,
  ResGetReviewListByRestaurant,
  ResGetReviewListByUser,
  ResGetReviewStatistic,
} from '@app/type';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';

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

  public async checkReview(id: number, payload: QueryCheckReview): Promise<void> {
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

  public async uploadReview(id: number, payload: DtoUploadReview): Promise<void> {
    const found_user: User = await this.user_repo.findOne(id);
    if (!found_user) {
      throw new ForbiddenException();
    }

    const found_restaurant: Restaurant = await this.restaurant_repo.findOne(payload.r_id);
    if (!found_restaurant) {
      throw new NotFoundException();
    }

    const review: Review = new Review();

    ['r_id'].forEach((e: string) => Reflect.deleteProperty(payload, e));

    Object.assign(review, { ...payload, r_id: found_restaurant.r_id, u_id: found_user.u_id});

    await this.review_repo.insert(review);

    await this.updateRestaurantStar(found_restaurant.r_id);
  }

  public async editReview(id: number, payload: DtoEditReview): Promise<void> {
    const found_review: Review = await this.review_repo.findOne({ r_id: payload.r_id, u_id: id });

    if (!found_review) {
      throw new NotFoundException();
    }

    const r_id: number = payload.r_id;

    ['r_id'].forEach((e: string) => Reflect.deleteProperty(payload, e));

    await this.review_repo.update({ r_id, u_id: id }, {
      ...payload, edit_time: new Date(), is_edited: true,
    });

    await this.updateRestaurantStar(found_review.r_id);
  }

  public async removeReview(id: number, param: ParamRemoveReview): Promise<void> {
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

  public async getReviewListByUser(id: number): Promise<ResGetReviewListByUser[]> {
    return (await this.getReviewList(id, EnumAccountType.NORMAL))
      .map((e_review: ResGetReviewList): ResGetReviewListByUser => {
        ['u_id'].forEach((e: string) => Reflect.deleteProperty(e_review, e));
        if (e_review.reply_review) {
          ['u_id'].forEach((e: string) => Reflect.deleteProperty(e_review.reply_review, e));
        }
        return e_review;
      });
  }

  public async getReviewListByRestaurant(id: number): Promise<ResGetReviewListByRestaurant[]> {
    return (await this.getReviewList(id, EnumAccountType.RESTAURANT))
      .map((e_review: ResGetReviewList): ResGetReviewListByRestaurant => {
        ['r_id'].forEach((e: string) => Reflect.deleteProperty(e_review, e));
        if (e_review.reply_review) {
          ['r_id'].forEach((e: string) => Reflect.deleteProperty(e_review.reply_review, e));
        }
        return e_review;
      });
  }

  public async getReviewStatistic(param: number | QueryGetReviewStatistic): Promise<ResGetReviewStatistic> {
    let found_restaurant: Restaurant;
    if ('number' === typeof param) {
      found_restaurant = await this.restaurant_repo.findOne(param);
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
    [...Array(6).keys()].forEach((e: number) => {
      star[e] = 0;
    });
    found_reviews.forEach((e_review: Review) => {
      star[Math.floor(e_review.star)] += 1;
      mean += e_review.star;
    });

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

  public async uploadReplyReview(id: number, payload: DtoUploadReplyReview): Promise<void> {

    const found_review: Review = await this.review_repo.findOne({ r_id: id, u_id: payload.u_id }, {
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.reply_review' },
      },
    });
    if (!found_review) {
      throw new NotFoundException();
    }

    const reply_review: ReplyReview = new ReplyReview();
    Object.assign(reply_review, { ...payload, r_id: found_review.r_id, u_id: found_review.u_id });
    await this.reply_review_repo.insert(reply_review);
  }

  public async editReplyReview(id: number, payload: DtoEditReplyReview): Promise<void> {
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

  public async removeReplyReview(id: number, param: ParamRemoveReplyReview): Promise<void> {
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
    found_reviews.forEach((e_review: Review) => {
      if (!e_review.is_edited) {
        ['edit_time'].forEach((e: string) => Reflect.deleteProperty(e_review, e));
      }
      if (e_review.reply_review && !e_review.reply_review.is_edited) {
        ['edit_time'].forEach((e: string) => Reflect.deleteProperty(e_review.reply_review, e));
      }
    });
    return found_reviews;
  }

  private async updateRestaurantStar(r_id: number): Promise<void> {
    const found_reviews: Review[] = await this.review_repo.find({
      select: ['star'],
      where: { restaurant: { r_id } },
    });

    let totalOfStar: number = 0;
    found_reviews.forEach((e_review: Review) => {
      totalOfStar += e_review.star;
    });

    if (0 < totalOfStar) {
      await this.restaurant_repo.update(r_id, { star: totalOfStar / found_reviews.length });
    }
  }
}
