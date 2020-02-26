import {
  ApiConflictResponse, ApiForbiddenResponse,
  ApiHeader, ApiNotFoundResponse,
  ApiOkResponse, ApiOperation, ApiQuery,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body, Controller, Delete, Get, Headers, HttpCode, HttpException, Inject, InternalServerErrorException,
  Patch, Post, Query, ValidationPipe,
} from '@nestjs/common';
import {
  DtoCheckPassword,  DtoCreateRestaurant,
  DtoEditAddress,  DtoEditPassword,  DtoEditRestaurantInfo,
  DtoSignIn,  DtoUploadCoupon,
  QueryCheckEmail,
} from '@app/req';
import { ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/res';
import { CouponService } from '@app/coupon';
import { MenuService } from '@app/menu';
import { RestaurantService } from '@app/restaurant';
import { UtilService } from '@app/util';
import getPrototypeOf = Reflect.getPrototypeOf;

@ApiTags('Restaurant')
@Controller('api/restaurant')
export class RestaurantController {
  @Inject() private readonly coupon_service: CouponService;
  @Inject() private readonly menu_service: MenuService;
  @Inject() private readonly restaurant_service: RestaurantService;
  @Inject() private readonly util_service: UtilService;

  @Get('auth/email')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 이메일 확인' })
  @ApiQuery({ name: 'email' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async check_email(@Query(new ValidationPipe()) query: QueryCheckEmail) {
    try {
      return await this.restaurant_service.check_email(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 회원가입' })
  @ApiOkResponse()
  public async create(@Body(new ValidationPipe()) payload: DtoCreateRestaurant) {
    try {
      return await this.restaurant_service.create_restaurant(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('auth/sign_in')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 로그인' })
  @ApiOkResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async sign_in(@Body(new ValidationPipe()) payload: DtoSignIn) {
    try {
      return await this.restaurant_service.sign_in(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 토큰 재발급' })
  @ApiHeader({ name: 'X-Refresh-Token' })
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public async refresh(@Headers('x-refresh-token') token) {
    try {
      return await this.restaurant_service.refresh(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 회원 탈퇴' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Headers('authorization') token) {
    try {
      return await this.restaurant_service.leave(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('auth')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 접근 토큰 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth() {

  }

  @Post('auth/password')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 비밀번호 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async check_password(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoCheckPassword,
  ) {
    try {
      return await this.restaurant_service.check_password(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('password')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 비밀번호 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_password(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditPassword,
  ) {
    try {
      return await this.restaurant_service.edit_password(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('info')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 정보 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_info(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditRestaurantInfo,
  ) {
    try {
      return await this.restaurant_service.edit_info(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('address')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 주소 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_address(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditAddress,
  ) {
    try {
      return await this.restaurant_service.edit_address(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '업체 정보 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResLoadRestaurant })
  @ApiNotFoundResponse()
  public async get(@Headers('authorization') token) {
    try {
      return await this.restaurant_service.get(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('coupon')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 쿠폰 등록' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  public async upload_coupon(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoUploadCoupon,
  ) {
    try {
      return await this.coupon_service.upload_coupon(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('coupon')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 쿠폰 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async get_coupon_list(@Headers('authorization') token) {
    try {
      return await this.coupon_service.get_coupon_list(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}
