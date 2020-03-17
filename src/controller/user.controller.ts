import {
  ApiConflictResponse, ApiForbiddenResponse,
  ApiHeader, ApiNotFoundResponse,
  ApiOkResponse, ApiOperation, ApiQuery,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body, Controller, Delete, Get,
  Headers, HttpCode, HttpException, Inject,
  InternalServerErrorException,
  Patch, Post, Query, ValidationPipe,
} from '@nestjs/common';
import {
  DtoCheckPassword, DtoCreateUser,
  DtoEditAddress, DtoEditPassword, DtoEditUserInfo,
  DtoSignIn, EnumSortOption,
  QueryCheckEmail, QueryGetRestaurantList,
} from '@app/type/req';
import { ResGetRestaurantList, ResLoadUser, ResRefresh, ResSignIn } from '@app/type/res';
import { CouponService } from '@app/coupon';
import { RestaurantService } from '@app/restaurant';
import { UserService } from '@app/user';
import { UtilService } from '@app/util';
import getPrototypeOf = Reflect.getPrototypeOf;

@ApiTags('user')
@Controller('api/user')
export class UserController {
  @Inject() private readonly c_service: CouponService;
  @Inject() private readonly r_service: RestaurantService;
  @Inject() private readonly u_service: UserService;
  @Inject() private readonly util_service: UtilService;

  @Get('auth/email')
  @HttpCode(200)
  @ApiOperation({ summary: '이메일 확인' })
  @ApiQuery({ name: 'email' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async check_email(@Query(new ValidationPipe()) query: QueryCheckEmail) {
    try {
      return this.u_service.check_email(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @HttpCode(200)
  @ApiOperation({ summary: '회원가입' })
  @ApiOkResponse()
  public async create(@Body(new ValidationPipe()) payload: DtoCreateUser) {
    try {
      return this.u_service.create(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('auth/sign_in')
  @HttpCode(200)
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async sign_in(@Body(new ValidationPipe()) payload: DtoSignIn) {
    try {
      return this.u_service.sign_in(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiHeader({ name: 'X-Refresh-Token' })
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public async refresh(@Headers('x-refresh-token') token) {
    try {
      return this.u_service.refresh(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @HttpCode(200)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Headers('authorization') token) {
    try {
      return this.u_service.leave(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('auth')
  @HttpCode(200)
  @ApiOperation({ summary: '접근 토큰 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth() {
    return null;
  }

  @Post('auth/password')
  @HttpCode(200)
  @ApiOperation({ summary: '비밀번호 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async check_password(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoCheckPassword,
  ) {
    try {
      return this.u_service.check_password(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('password')
  @HttpCode(200)
  @ApiOperation({ summary: '비밀번호 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_password(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditPassword,
  ) {
    try {
      return this.u_service.edit(this.util_service.get_token_body(token.authorization), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('info')
  @HttpCode(200)
  @ApiOperation({ summary: '정보 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_profile(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditUserInfo,
  ) {
    try {
      return this.u_service.edit(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('address')
  @HttpCode(200)
  @ApiOperation({ summary: '주소 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_address(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditAddress,
  ) {
    try {
      return this.u_service.edit(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '정보 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResLoadUser })
  @ApiNotFoundResponse()
  public async get(@Headers('authorization') header) {
    try {
      return this.u_service.get(this.util_service.get_token_body(header));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('restaurant')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 리스트 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResGetRestaurantList })
  @ApiQuery({ name: 'category' })
  @ApiQuery({ enum: EnumSortOption, name: 'sort_option', type: 'enum' })
  @ApiNotFoundResponse()
  public async get_restaurant_list(
    @Headers('authorization') token,
    @Query(new ValidationPipe()) query: QueryGetRestaurantList,
  ) {
    try {
      return this.r_service.get_list(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}
