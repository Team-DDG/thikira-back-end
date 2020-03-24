import {
  ApiHeader, ApiNotFoundResponse,
  ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import {
  Body, Controller, Get, Headers,
  HttpCode, HttpException, Inject,
  InternalServerErrorException,
  Post, ValidationPipe,
} from '@nestjs/common';
import { CouponService } from '@app/coupon';
import { DtoUploadCoupon } from '@app/type/req';
import { Header } from '@app/type/etc';
import { ResGetCouponList } from '@app/type/res';
import { UtilService } from '@app/util';
import getPrototypeOf = Reflect.getPrototypeOf;

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
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  public async upload_coupon(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadCoupon,
  ): Promise<void> {
    try {
      return this.c_service.upload(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '업체 쿠폰 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async get_coupon_list(@Headers() header: Header): Promise<ResGetCouponList[]> {
    try {
      return this.c_service.get_list(this.util_service.get_token_body(header));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}
