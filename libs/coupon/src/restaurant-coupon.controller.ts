import { DtoUploadCoupon, Header, ResGetCouponList } from '@app/type';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Post,
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
  @Inject()
  private readonly util_service: UtilService;

  @Get()
  @ApiOperation({ summary: '업체 쿠폰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async getCouponList(@Headers() header: Header): Promise<ResGetCouponList[]> {
    try {
      return this.coupon_service.getList(this.util_service.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @ApiOperation({ summary: '업체 쿠폰 등록' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  public async uploadCoupon(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadCoupon,
  ): Promise<void> {
    try {
      return this.coupon_service.upload(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
