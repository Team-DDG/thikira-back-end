import { Header } from '@app/type/etc';
import { QueryGetCoupon } from '@app/type/req';
import { ResGetCoupon } from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponService } from './coupon.service';

@ApiTags('user/coupon')
@Controller('api/user/coupon')
export class UserCouponController {
  @Inject()
  private readonly couponService: CouponService;
  @Inject()
  private readonly utilService: UtilService;

  @Get()

  @ApiOperation({ summary: '쿠폰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResGetCoupon })
  @ApiNotFoundResponse()
  public async getCoupon(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetCoupon,
  ): Promise<ResGetCoupon> {
    try {
      return this.couponService.get(query);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }
}
