import { JwtAuthGuard } from '@app/auth';
import { QueryGetCoupon, ResGetCoupon } from '@app/type';
import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponService } from './coupon.service';

@ApiTags('user/coupon')
@Controller('api/user/coupon')
export class UserCouponController {
  @Inject()
  private readonly coupon_service: CouponService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '쿠폰 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResGetCoupon })
  @ApiNotFoundResponse({ description: '\"not exist restaurant\" | null' })
  public async getCoupon(
    @Query(new ValidationPipe()) query: QueryGetCoupon,
  ): Promise<ResGetCoupon> {
    try {
      return this.coupon_service.get(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
