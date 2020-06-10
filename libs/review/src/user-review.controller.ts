import { JwtAuthGuard } from '@app/auth';
import {
  DtoEditReview,
  DtoUploadReview,
  ParamRemoveReview,
  QueryCheckReview,
  QueryGetReviewStatistic,
  RequestClass,
  ResGetReviewList,
  ResGetReviewListByUser,
  ResGetReviewStatistic,
} from '@app/type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
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

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '리뷰 등록 가능 여부 확인' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse({ description: '\"user haven\'t order by the restaurant\" | null' })
  @ApiConflictResponse()
  public async checkReview(
    @Req() { user: { id } }: RequestClass,
    @Query(new ValidationPipe()) query: QueryCheckReview,
  ): Promise<void> {
    try {
      return this.review_service.checkReview(id, query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '리뷰 등록' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async uploadReview(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoUploadReview,
  ): Promise<void> {
    try {
      return this.review_service.uploadReview(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주문 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async getReviewList(@Req() { user: { id } }: RequestClass): Promise<ResGetReviewListByUser[]> {
    try {
      return this.review_service.getReviewListByUser(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('statistic')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 리뷰 통계 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResGetReviewStatistic })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async getReviewStatistic(
    @Query(new ValidationPipe()) query: QueryGetReviewStatistic,
  ): Promise<ResGetReviewStatistic> {
    try {
      return this.review_service.getReviewStatistic(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '리뷰 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editReview(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditReview,
  ): Promise<void> {
    try {
      return this.review_service.editReview(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete(':r_id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeReview(
    @Req() { user: { id } }: RequestClass,
    @Param(new ValidationPipe()) param: ParamRemoveReview,
  ): Promise<void> {
    try {
      return this.review_service.removeReview(id, param);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
