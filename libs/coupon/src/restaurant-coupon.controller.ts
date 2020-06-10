import { JwtAuthGuard } from '@app/auth';
import { DtoUploadCoupon, RequestClass, ResGetCouponList } from '@app/type';
import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CouponService } from './coupon.service';

@ApiTags('restaurant/coupon')
@Controller('api/restaurant/coupon')
export class RestaurantCouponController {
  @Inject()
  private readonly coupon_service: CouponService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 쿠폰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async getCouponList(@Req() { user: { id } }: RequestClass): Promise<ResGetCouponList[]> {
    try {
      return this.coupon_service.getList(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 쿠폰 등록' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  public async uploadCoupon(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoUploadCoupon,
  ): Promise<void> {
    try {
      return this.coupon_service.upload(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
