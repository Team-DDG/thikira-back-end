import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller, Get, Headers, HttpCode,
  HttpException, Inject,
  InternalServerErrorException,
  Query, ValidationPipe,
} from '@nestjs/common';
import { CouponService } from '@app/coupon';
import { Header } from '@app/type/etc';
import { QueryGetCoupon } from '@app/type/req';
import { ResGetCoupon } from '@app/type/res';
import { UtilService } from '@app/util';
import getPrototypeOf = Reflect.getPrototypeOf;

@ApiTags('user/coupon')
@Controller('api/user/coupon')
export class UserCouponController {
  @Inject() private readonly coupon_service: CouponService;
  @Inject() private readonly util_service: UtilService;

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '쿠폰 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResGetCoupon })
  @ApiNotFoundResponse()
  public async get_coupon(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetCoupon,
  ): Promise<ResGetCoupon> {
    try {
      return this.coupon_service.get(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}