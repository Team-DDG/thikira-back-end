import { Header } from '@app/type/etc';
import {
  DtoCheckPassword,
  DtoCreateRestaurant,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditRestaurantInfo,
  DtoSignIn,
  QueryCheckEmail,
} from '@app/type/req';
import { ResLoadRestaurant, ResRefresh, ResSignIn } from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';

@ApiTags('restaurant')
@Controller('api/restaurant')
export class RestaurantController {
  @Inject()
  private readonly r_service: RestaurantService;
  @Inject()
  private readonly util_service: UtilService;

  @Get('auth')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 접근 토큰 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth(): void {

  }

  @Post('auth/password')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 비밀번호 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async check_password(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoCheckPassword,
  ): Promise<void> {
    try {
      return this.r_service.check_password(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/email')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 이메일 중복 확인' })
  @ApiQuery({ name: 'email' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async check_email(@Query(new ValidationPipe()) query: QueryCheckEmail): Promise<void> {
    try {
      return this.r_service.check_email(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 회원가입' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async create(@Body(new ValidationPipe()) payload: DtoCreateRestaurant): Promise<void> {
    try {
      return this.r_service.create(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('address')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 주소 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_address(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditAddress,
  ): Promise<void> {
    try {
      return this.r_service.edit(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('info')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 정보 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_info(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditRestaurantInfo,
  ): Promise<void> {
    try {
      return this.r_service.edit(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('password')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 비밀번호 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_password(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditPassword,
  ): Promise<void> {
    try {
      return this.r_service.edit_password(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '업체 정보 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResLoadRestaurant })
  @ApiNotFoundResponse()
  public async get(@Headers() header: Header): Promise<ResLoadRestaurant> {
    try {
      return this.r_service.load(this.util_service.get_token_body(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 회원 탈퇴' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Headers() token: Header): Promise<void> {
    try {
      return this.r_service.leave(
        this.util_service.get_token_body(token));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('auth/sign_in')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 로그인' })
  @ApiOkResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async sign_in(@Body(new ValidationPipe()) payload: DtoSignIn): Promise<ResSignIn> {
    try {
      return this.r_service.sign_in(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '업체 토큰 재발급' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public refresh(@Headers() token: Header): ResRefresh {
    return this.r_service.refresh(this.util_service.get_token_body(token));
  }
}
