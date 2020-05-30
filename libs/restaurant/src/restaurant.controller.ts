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
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';

@ApiTags('restaurant')
@Controller('api/restaurant')
export class RestaurantController {
  @Inject()
  private readonly restaurantService: RestaurantService;
  @Inject()
  private readonly utilService: UtilService;

  @Get('auth')

  @ApiOperation({ summary: '업체 접근 토큰 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth(): void {

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
      return this.restaurantService.edit(this.utilService.getTokenBody(header), payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get('auth/email')

  @ApiOperation({ summary: '업체 이메일 중복 확인' })
  @ApiQuery({ name: 'email' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async checkEmail(@Query(new ValidationPipe()) query: QueryCheckEmail): Promise<void> {
    try {
      return this.restaurantService.checkEmail(query);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
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
      return this.restaurantService.checkPassword(this.utilService.getTokenBody(header), payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Post('create')
  @ApiOperation({ summary: '업체 회원가입' })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  public async create(@Body(new ValidationPipe()) payload: DtoCreateRestaurant): Promise<void> {
    try {
      return this.restaurantService.create(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
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
      return this.restaurantService.edit(this.utilService.getTokenBody(header), payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
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
      return this.restaurantService.editPassword(this.utilService.getTokenBody(header), payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get()
  @ApiOperation({ summary: '업체 정보 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResLoadRestaurant })
  @ApiNotFoundResponse()
  public async get(@Headers() header: Header): Promise<ResLoadRestaurant> {
    try {
      return this.restaurantService.load(this.utilService.getTokenBody(header));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Delete('leave')
  @ApiOperation({ summary: '업체 회원 탈퇴' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Headers() token: Header): Promise<void> {
    try {
      return this.restaurantService.leave(
        this.utilService.getTokenBody(token));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get('auth/refresh')
  @ApiOperation({ summary: '업체 토큰 재발급' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public refresh(@Headers() token: Header): ResRefresh {
    return this.restaurantService.refresh(this.utilService.getTokenBody(token));
  }

  @Post('auth/sign_in')
  @ApiOperation({ summary: '업체 로그인' })
  @ApiCreatedResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async signIn(@Body(new ValidationPipe()) payload: DtoSignIn): Promise<ResSignIn> {
    try {
      return this.restaurantService.signIn(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }
}
