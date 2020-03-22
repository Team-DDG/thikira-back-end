import { ApiConflictResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller, Delete, Get, Headers,
  HttpCode, HttpException, Inject,
  InternalServerErrorException, Patch, Post, ValidationPipe,
} from '@nestjs/common';
import {
  DtoEditReplyReview, DtoUploadReplyReview,
  ResGetReviewList, ResGetReviewStatistic,
} from '@app/type';
import { Header } from '@app/type/etc';
import { ReviewService } from '@app/review';
import { UtilService } from '@app/util';
import getPrototypeOf = Reflect.getPrototypeOf;

@ApiTags('restaurant/review')
@Controller('api/restaurant/review')
export class RestaurantReviewController {
  @Inject() private readonly review_service: ReviewService;
  @Inject() private readonly util_service: UtilService;

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '업체 리뷰 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async get_reviews(@Headers() header: Header): Promise<ResGetReviewList[]> {
    try {
      return this.review_service.get_review_list_by_restaurant(this.util_service.get_token_body(header));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('statistic')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 리뷰 통계 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResGetReviewStatistic })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async get_review_statistic(@Headers() header: Header): Promise<ResGetReviewStatistic> {
    try {
      return this.review_service.get_review_statistic(this.util_service.get_token_body(header));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('reply')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 답변 리뷰 등록' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async upload_reply_review(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.upload_reply_review(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('reply')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 답변 리뷰 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_reply_review(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.edit_reply_review(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Delete('reply')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 답변 리뷰 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_reply_review(@Headers() header: Header): Promise<void> {
    try {
      return this.review_service.remove_reply_review(this.util_service.get_token_body(header));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}
