import {
  DtoEditReview,
  DtoUploadReview,
  QueryCheckReview,
  QueryGetReviewStatistic,
  ResGetReviewList,
  ResGetReviewStatistic,
} from '@app/type';
import { Header } from '@app/type/etc';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';

@ApiTags('user/review')
@Controller('api/user/review')
export class UserReviewController {
  @Inject()
  private readonly review_service: ReviewService;
  @Inject()
  private readonly utilService: UtilService;

  @Get('check')

  @ApiOperation({ summary: '리뷰 등록 가능 여부 확인' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse({ description: '\"user haven\'t order by the restaurant\" | null' })
  @ApiConflictResponse()
  public async checkReview(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryCheckReview,
  ): Promise<void> {
    try {
      return this.review_service.checkReview(this.utilService.getTokenBody(header), query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()

  @ApiOperation({ summary: '리뷰 등록' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async uploadReview(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadReview,
  ): Promise<void> {
    try {
      return this.review_service.uploadReview(this.utilService.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()

  @ApiOperation({ summary: '주문 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async getReviewList(@Headers() header: Header): Promise<ResGetReviewList[]> {
    try {
      return this.review_service.getReviewListByUser(this.utilService.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('statistic')

  @ApiOperation({ summary: '업체 리뷰 통계 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResGetReviewStatistic })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async getReviewStatistic(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetReviewStatistic,
  ): Promise<ResGetReviewStatistic> {
    try {
      return this.review_service.getReviewStatistic(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch()
  @ApiOperation({ summary: '리뷰 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editReview(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditReview,
  ): Promise<void> {
    try {
      return this.review_service.editReview(this.utilService.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete()
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeReview(
    @Headers() header: Header,
  ): Promise<void> {
    try {
      return this.review_service.removeReview(this.utilService.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
