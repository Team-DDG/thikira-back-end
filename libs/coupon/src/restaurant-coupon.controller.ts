import { Header } from '@app/type/etc';
import { DtoUploadCoupon } from '@app/type/req';
import { ResGetCouponList } from '@app/type/res';
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CouponService } from './coupon.service';

@ApiTags('restaurant/coupon')
@Controller('api/restaurant/coupon')
export class RestaurantCouponController {
  @Inject()
  private readonly couponService: CouponService;
  @Inject()
  private readonly utilService: UtilService;

  @Get()
  @ApiOperation({ summary: '업체 쿠폰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async getCouponList(@Headers() header: Header): Promise<ResGetCouponList[]> {
    try {
      return this.couponService.getList(this.utilService.getTokenBody(header));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
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
      return this.couponService.upload(this.utilService.getTokenBody(header), payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }
}
