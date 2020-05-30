import { AuthService } from '@app/auth';
import { Order, ReplyReview, Restaurant, Review, User } from '@app/entity';
import { EnumUserType } from '@app/type';
import { ParsedTokenClass } from '@app/type/etc';
import {
  DtoEditReplyReview,
  DtoEditReview,
  DtoUploadReplyReview,
  DtoUploadReview,
  QueryCheckReview,
  QueryGetReviewStatistic,
} from '@app/type/req';
import { ResGetReviewList, ResGetReviewStatistic } from '@app/type/res';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindConditions } from 'typeorm';

@Injectable()
export class ReviewService {
  @InjectRepository(Order, 'mongodb')
  private readonly orderRepo: Repository<Order>;
  @InjectRepository(Restaurant, 'mysql')
  private readonly restaurantRepo: Repository<Restaurant>;
  @InjectRepository(Review, 'mysql')
  private readonly reviewRepo: Repository<Review>;
  @InjectRepository(ReplyReview, 'mysql')
  private readonly replyReviewRepo: Repository<ReplyReview>;
  @InjectRepository(User, 'mysql')
  private readonly userRepo: Repository<User>;
  @Inject()
  private readonly tokenService: AuthService;

  // review

  public async checkReview(token: string, payload: QueryCheckReview): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    if (!foundUser) {
      throw new ForbiddenException();
    }
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(parseInt(payload.restaurantId));
    if (!foundRestaurant) {
      throw new NotFoundException();
    }
    const foundOrder: Order[] = await this.orderRepo.find({
      restaurantId: foundRestaurant.restaurantId, userId: foundUser.userId,
    });

    if (1 > foundOrder.length) {
      throw new ForbiddenException('user haven\'t order by the restaurant');
    }
    const foundReview: Review = await this.reviewRepo.findOne({
      restaurant: foundRestaurant, user: foundUser,
    });
    if (foundReview) {
      throw new ConflictException();
    }
  }

  public async uploadReview(token: string, payload: DtoUploadReview): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    if (!foundUser) {
      throw new ForbiddenException();
    }

    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(payload.restaurantId);
    if (!foundRestaurant) {
      throw new NotFoundException();
    }

    const review: Review = new Review();
    for (const element of ['restaurantId']) {
      Reflect.deleteProperty(payload, element);
    }
    Object.assign(review, { ...payload, restaurant: foundRestaurant, user: foundUser });
    await this.reviewRepo.insert(review);
  }

  public async editReview(token: string, payload: DtoEditReview): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    const foundReview: Review = await this.reviewRepo.findOne({ user: foundUser });
    if (!foundReview) {
      throw new NotFoundException();
    }
    await this.reviewRepo.update(foundReview.reviewId, {
      ...payload, editTime: new Date(), isEdited: true,
    });
  }

  public async removeReview(token: string): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundUser: User = await this.userRepo.findOne(id);
    const foundReview: Review = await this.reviewRepo.findOne({
      join: {
        alias: 'Review',
        leftJoinAndSelect: {
          ReplyReview: 'Review.replyReview',
        },
      },
      where: { user: foundUser },
    });
    if (!foundReview) {
      throw new NotFoundException();
    }
    if (foundReview.replyReview) {
      await this.replyReviewRepo.delete(foundReview.replyReview.restaurantId);
    }
    await this.reviewRepo.delete(foundReview.reviewId);
  }

  public async getReviewList(id: number, userType: EnumUserType): Promise<ResGetReviewList[]> {
    const findOption: FindConditions<Review> = {};

    if (userType === EnumUserType.NORMAL) {
      findOption.user = { userId: id };
    } else {
      findOption.restaurant = { restaurantId: id };
    }

    const foundReviews: Review[] = await this.reviewRepo.find({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.replyReview' },
      },
      where: findOption,
    });
    if (!foundReviews) {
      throw new NotFoundException();
    }
    for (const elementReview of foundReviews) {
      if (!elementReview.isEdited) {
        Reflect.deleteProperty(elementReview, 'editTime');
      }
      if (elementReview.replyReview && !elementReview.replyReview.isEdited) {
        Reflect.deleteProperty(elementReview.replyReview, 'editTime');
      }
    }
    return foundReviews;
  }

  public async getReviewListByUser(token: string): Promise<ResGetReviewList[]> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    return this.getReviewList(id, EnumUserType.NORMAL);
  }

  public async getReviewListByRestaurant(token: string): Promise<ResGetReviewList[]> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    return this.getReviewList(id, EnumUserType.RESTAURANT);
  }

  public async getReviewStatistic(param: string | QueryGetReviewStatistic): Promise<ResGetReviewStatistic> {
    let foundRestaurant: Restaurant;
    if ('string' === typeof param) {
      const { id }: ParsedTokenClass = this.tokenService.parseToken(param);
      foundRestaurant = await this.restaurantRepo.findOne(id);
    } else {
      foundRestaurant = await this.restaurantRepo.findOne(parseInt(param.restaurantId));
    }
    const foundReviews: Review[] = await this.reviewRepo.find({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.replyReview' },
      },
      where: { restaurant: foundRestaurant },
    });
    if (1 > foundReviews.length) {
      throw new NotFoundException();
    }
    const star: number[] = [];
    let mean: number = 0;
    for (const loop of [0, 1, 2, 3, 4, 5]) {
      star[loop] = 0;
    }
    for (const elementReview of foundReviews) {
      star[Math.floor(elementReview.star)] += 1;
      mean += elementReview.star;
    }

    mean /= foundReviews.length;
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

  // replyReview

  public async uploadReplyReview(token: string, payload: DtoUploadReplyReview): Promise<void> {
    const foundReview: Review = await this.reviewRepo.findOne(payload.reviewId, {
      join: {
        alias: 'Review',
        leftJoinAndSelect: { ReplyReview: 'Review.replyReview' },
      },
    });
    if (!foundReview) {
      throw new NotFoundException();
    }
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);

    const replyReview: ReplyReview = new ReplyReview();
    Object.assign(replyReview, { ...payload, restaurant: foundRestaurant, review: foundReview });
    await this.replyReviewRepo.insert(replyReview);
  }

  public async editReplyReview(token: string, payload: DtoEditReplyReview): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    const foundReplyReview: ReplyReview = await this.replyReviewRepo.findOne({ restaurant: foundRestaurant });
    if (!foundReplyReview) {
      throw new NotFoundException();
    }
    await this.replyReviewRepo.update(foundReplyReview.restaurantId, {
      ...payload, editTime: new Date(), isEdited: true,
    });
  }

  public async removeReplyReview(token: string): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundRestaurant: Restaurant = await this.restaurantRepo.findOne(id);
    const foundReplyReview: ReplyReview = await this.replyReviewRepo.findOne({ restaurant: foundRestaurant });
    await this.replyReviewRepo.delete(foundReplyReview.restaurantId);
  }
}
