import {
  ApiHeader, ApiNotFoundResponse,
  ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import {
  Controller, Get, Headers, HttpCode, Inject,
  InternalServerErrorException,
  Query, ValidationPipe,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Header } from '@app/type/etc';
import { QueryGetCoupon } from '@app/type/req';
import { ResGetCoupon } from '@app/type/res';
import { UtilService } from '@app/util';

@ApiTags('req/coupon')
@Controller('api/req/coupon')
export class UserCouponController {
  @Inject()
  private readonly c_service: CouponService;
  @Inject()
  private readonly util_service: UtilService;

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
      return this.c_service.get(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
