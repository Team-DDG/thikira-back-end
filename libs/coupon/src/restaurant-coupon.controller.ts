import { Header } from '@app/type/etc';
import { DtoUploadCoupon } from '@app/type/req';
import { ResGetCouponList } from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponService } from './coupon.service';

@ApiTags('restaurant/coupon')
@Controller('api/restaurant/coupon')
export class RestaurantCouponController {
  @Inject()
  private readonly c_service: CouponService;
  @Inject()
  private readonly util_service: UtilService;

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '업체 쿠폰 등록' })
  @ApiBearerAuth()
  @ApiOkResponse()
  public async upload_coupon(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadCoupon,
  ): Promise<void> {
    try {
      return this.c_service.upload(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '업체 쿠폰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async get_coupon_list(@Headers() header: Header): Promise<ResGetCouponList[]> {
    try {
      return this.c_service.get_list(this.util_service.get_token_body(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
