import { JwtAuthGuard } from '@app/auth';
import {
  DtoEditReplyReview,
  DtoUploadReplyReview,
  ParamRemoveReplyReview,
  RequestClass,
  ResGetReviewList,
  ResGetReviewListByRestaurant,
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

@ApiTags('restaurant/review')
@Controller('api/restaurant/review')
export class RestaurantReviewController {
  @Inject()
  private readonly review_service: ReviewService;

  @Patch('reply')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 답변 리뷰 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editReplyReview(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.editReplyReview(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 리뷰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async getReviewList(@Req() { user: { id } }: RequestClass): Promise<ResGetReviewListByRestaurant[]> {
    try {
      return this.review_service.getReviewListByRestaurant(id);
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
  public async getReviewStatistic(@Req() { user: { id } }: RequestClass): Promise<ResGetReviewStatistic> {
    try {
      return this.review_service.getReviewStatistic(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('reply/:u_id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 답변 리뷰 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeReplyReview(
    @Req() { user: { id } }: RequestClass,
    @Param(new ValidationPipe()) param: ParamRemoveReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.removeReplyReview(id, param);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('reply')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 답변 리뷰 등록' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiConflictResponse()
  public async uploadReplyReview(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoUploadReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.uploadReplyReview(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
