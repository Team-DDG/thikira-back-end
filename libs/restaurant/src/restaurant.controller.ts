import { JwtAuthGuard } from '@app/auth';
import {
  DtoCheckPassword,
  DtoCreateRestaurant,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditRestaurantInfo,
  DtoSignIn,
  QueryCheckEmail,
  RequestClass,
  ResLoadRestaurant,
  ResRefresh,
  ResSignIn,
} from '@app/type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 정보 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResLoadRestaurant })
  @ApiNotFoundResponse()
  public async get(@Req() { user: { id } }: RequestClass): Promise<ResLoadRestaurant> {
    try {
      return this.restaurant_service.load(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('address')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 주소 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editAddress(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditAddress,
  ): Promise<void> {
    try {
      return this.restaurant_service.edit(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 비밀번호 확인' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  public async checkPassword(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoCheckPassword,
  ): Promise<void> {
    try {
      return this.restaurant_service.checkPassword(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 토큰 재발급' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public refresh(@Req() { user: { id } }: RequestClass): ResRefresh {
    return this.restaurant_service.refresh(id);
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 정보 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editInfo(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditRestaurantInfo,
  ): Promise<void> {
    try {
      return this.restaurant_service.edit(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 회원 탈퇴' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Req() { user: { id } }: RequestClass): Promise<void> {
    try {
      return this.restaurant_service.leave(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 비밀번호 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editPassword(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditPassword,
  ): Promise<void> {
    try {
      return this.restaurant_service.editPassword(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
