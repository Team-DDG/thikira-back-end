import { AuthService } from '@app/auth';
import { Order, ReplyReview, Restaurant, Review, User } from '@app/entity';
import {
  DtoEditReplyReview,
  DtoEditReview,
  DtoUploadReplyReview,
  DtoUploadReview,
  EnumAccountType,
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
    const numOfOrders: number = await this.orderRepo.count({
      restaurantId: foundRestaurant.restaurantId, userId: foundUser.userId,
    });

    if (1 > numOfOrders) {
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

    await this.updateRestaurantStar(foundRestaurant.restaurantId);
  }

  public async editReview(token: string, payload: DtoEditReview): Promise<void> {
    const foundReview: Review = await this.reviewRepo.findOne({
      join: {
        alias: 'Review',
        leftJoinAndSelect: { Restaurant: 'Review.restaurant' },
      },
      where: { restaurant: { restaurantId: payload.restaurantId } },
    });
    if (!foundReview) {
      throw new NotFoundException();
    }

    ['restaurantId'].map((element: string): void => {
      Reflect.deleteProperty(payload, element);
    });

    await this.reviewRepo.update(foundReview.reviewId, {
      ...payload, editTime: new Date(), isEdited: true,
    });

    await this.updateRestaurantStar(foundReview.restaurant.restaurantId);
  }

  public async removeReview(token: string, param: ParamRemoveReview): Promise<void> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    const foundReview: Review = await this.reviewRepo.findOne({
      join: {
        alias: 'Review',
        leftJoinAndSelect: {
          ReplyReview: 'Review.replyReview',
        },
      },
      where: { restaurant: { restaurantId: param.restaurantId }, user: { userId: id } },
    });
    if (!foundReview) {
      throw new NotFoundException();
    }
    if (foundReview.replyReview) {
      await this.replyReviewRepo.delete(param.restaurantId);
    }
    await this.reviewRepo.delete(foundReview.reviewId);

    await this.updateRestaurantStar(parseInt(param.restaurantId));
  }

  public async getReviewListByUser(token: string): Promise<ResGetReviewList[]> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    return this.getReviewList(id, EnumAccountType.NORMAL);
  }

  public async getReviewListByRestaurant(token: string): Promise<ResGetReviewList[]> {
    const { id }: ParsedTokenClass = this.tokenService.parseToken(token);
    return this.getReviewList(id, EnumAccountType.RESTAURANT);
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

  // replyReview {

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

  // }

  private async getReviewList(id: number, userType: EnumAccountType): Promise<ResGetReviewList[]> {
    const findOption: FindConditions<Review> = {};

    if (userType === EnumAccountType.NORMAL) {
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

  private async updateRestaurantStar(restaurantId: number): Promise<void> {
    const foundReviews: Review[] = await this.reviewRepo.find({
      select: ['star'],
      where: { restaurant: { restaurantId } },
    });

    let totalOfStar: number = 0;
    for (const elementReview of foundReviews) {
      totalOfStar += elementReview.star;
    }

    if (totalOfStar != 0) {
      await this.restaurantRepo.update(restaurantId, { star: totalOfStar / foundReviews.length });
    }
  }
}
