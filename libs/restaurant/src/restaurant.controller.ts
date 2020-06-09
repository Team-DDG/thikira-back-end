import {
  DtoCheckPassword,
  DtoCreateRestaurant,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditRestaurantInfo,
  DtoSignIn,
  Header,
  QueryCheckEmail,
  ResLoadRestaurant,
  ResRefresh,
  ResSignIn,
} from '@app/type';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
  ApiCreatedResponse,
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
  private readonly restaurant_service: RestaurantService;
  @Inject()
  private readonly util_service: UtilService;

  @Get()
  @ApiOperation({ summary: '업체 정보 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResLoadRestaurant })
  @ApiNotFoundResponse()
  public async get(@Headers() header: Header): Promise<ResLoadRestaurant> {
    try {
      return this.restaurant_service.load(this.util_service.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('address')
  @ApiOperation({ summary: '업체 주소 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editAddress(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditAddress,
  ): Promise<void> {
    try {
      return this.restaurant_service.edit(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth')
  @ApiOperation({ summary: '업체 접근 토큰 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth(): void {

  }

  @Get('auth/email')
  @ApiOperation({ summary: '업체 이메일 중복 확인' })
  @ApiQuery({ name: 'email' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async checkEmail(@Query(new ValidationPipe()) query: QueryCheckEmail): Promise<void> {
    try {
      return this.restaurant_service.checkEmail(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('auth/password')
  @ApiOperation({ summary: '업체 비밀번호 확인' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  public async checkPassword(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoCheckPassword,
  ): Promise<void> {
    try {
      return this.restaurant_service.checkPassword(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @ApiOperation({ summary: '업체 토큰 재발급' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public refresh(@Headers() token: Header): ResRefresh {
    return this.restaurant_service.refresh(this.util_service.getTokenBody(token));
  }

  @Post('auth/sign_in')
  @ApiOperation({ summary: '업체 로그인' })
  @ApiCreatedResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async signIn(@Body(new ValidationPipe()) payload: DtoSignIn): Promise<ResSignIn> {
    try {
      return this.restaurant_service.signIn(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @ApiOperation({ summary: '업체 회원가입' })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  public async create(@Body(new ValidationPipe()) payload: DtoCreateRestaurant): Promise<void> {
    try {
      return this.restaurant_service.create(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('info')
  @ApiOperation({ summary: '업체 정보 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editInfo(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditRestaurantInfo,
  ): Promise<void> {
    try {
      return this.restaurant_service.edit(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @ApiOperation({ summary: '업체 회원 탈퇴' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Headers() token: Header): Promise<void> {
    try {
      return this.restaurant_service.leave(
        this.util_service.getTokenBody(token));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('password')
  @ApiOperation({ summary: '업체 비밀번호 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editPassword(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditPassword,
  ): Promise<void> {
    try {
      return this.restaurant_service.editPassword(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
