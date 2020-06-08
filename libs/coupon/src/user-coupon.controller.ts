import { Header, QueryGetCoupon, ResGetCoupon } from '@app/type';
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
  @ApiNotFoundResponse({ description: '\"not exist restaurant\" | null' })
  public async getCoupon(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetCoupon,
  ): Promise<ResGetCoupon> {
    try {
      return this.couponService.get(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
