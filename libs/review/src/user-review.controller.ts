import {
  ApiConflictResponse, ApiForbiddenResponse, ApiHeader,
  ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import {
  Body, Controller, Delete, Get,
  Headers, HttpCode,
  Inject, InternalServerErrorException,
  Patch, Post, Query, ValidationPipe,
} from '@nestjs/common';
import {
  DtoEditReview, DtoUploadReview,
  QueryCheckReview, QueryGetReviewStatistic,
  ResGetReviewList, ResGetReviewStatistic,
} from '@app/type';
import { Header } from '@app/type/etc';
import { ReviewService } from './review.service';
import { UtilService } from '@app/util';

@ApiTags('req/review')
@Controller('api/req/review')
export class UserReviewController {
  @Inject()
  private readonly review_service: ReviewService;
  @Inject()
  private readonly util_service: UtilService;

  @Get('check')
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 등록 가능 여부 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse({ description: '\"req haven\'t order by the restaurant\" | null' })
  @ApiConflictResponse()
  public async check_review(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryCheckReview,
  ): Promise<void> {
    try {
      return this.review_service.check_review(this.util_service.get_token_body(header), query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 등록' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async upload_review(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadReview,
  ): Promise<void> {
    try {
      return this.review_service.upload_review(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '주문 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async get_reviews(@Headers() header: Header): Promise<ResGetReviewList[]> {
    try {
      return this.review_service.get_review_list_by_user(this.util_service.get_token_body(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('statistic')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 리뷰 통계 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResGetReviewStatistic })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async get_review_statistic(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetReviewStatistic,
  ): Promise<ResGetReviewStatistic> {
    try {
      return this.review_service.get_review_statistic(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch()
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_review(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditReview,
  ): Promise<void> {
    try {
      return this.review_service.edit_review(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete()
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_review(
    @Headers() header: Header,
  ): Promise<void> {
    try {
      return this.review_service.remove_review(this.util_service.get_token_body(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
