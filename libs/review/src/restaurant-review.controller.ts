import {
  DtoEditReplyReview,
  DtoUploadReplyReview,
  Header,
  ParamRemoveReplyReview,
  ResGetReviewList,
  ResGetReviewStatistic,
} from '@app/type';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
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
import { ResGetReviewListByRestaurant } from '../../type/src/res/review/get-review-list-by-restaurant.res';
import { ReviewService } from './review.service';

@ApiTags('restaurant/review')
@Controller('api/restaurant/review')
export class RestaurantReviewController {
  @Inject()
  private readonly review_service: ReviewService;
  @Inject()
  private readonly util_service: UtilService;

  @Patch('reply')
  @ApiOperation({ summary: '업체 답변 리뷰 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editReplyReview(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.editReplyReview(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @ApiOperation({ summary: '업체 리뷰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetReviewList] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  public async getReviewList(@Headers() header: Header): Promise<ResGetReviewListByRestaurant[]> {
    try {
      return this.review_service.getReviewListByRestaurant(this.util_service.getTokenBody(header));
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
  public async getReviewStatistic(@Headers() header: Header): Promise<ResGetReviewStatistic> {
    try {
      return this.review_service.getReviewStatistic(this.util_service.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('reply/:u_id')
  @ApiOperation({ summary: '업체 답변 리뷰 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeReplyReview(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.removeReplyReview(this.util_service.getTokenBody(header), param);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('reply')
  @ApiOperation({ summary: '업체 답변 리뷰 등록' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async uploadReplyReview(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadReplyReview,
  ): Promise<void> {
    try {
      return this.review_service.uploadReplyReview(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
