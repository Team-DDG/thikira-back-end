import { JwtAuthGuard } from '@app/auth';
import { RestaurantService } from '@app/restaurant';
import {
  DtoCheckPassword,
  DtoCreateUser,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditUserInfo,
  DtoSignIn,
  EnumSortOption,
  QueryCheckEmail,
  QueryGetRestaurantList,
  RequestClass,
  ResGetRestaurantList,
  ResLoadUser,
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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  @Inject()
  private readonly restaurant_service: RestaurantService;
  @Inject()
  private readonly user_service: UserService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '정보 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResLoadUser })
  @ApiNotFoundResponse()
  public async get(@Req() { user: { id } }: RequestClass): Promise<ResLoadUser> {
    try {
      return this.user_service.load(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '접근 토큰 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth(): void {
  }

  @Get('auth/email')
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiQuery({ name: 'email' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async checkEmail(@Query(new ValidationPipe()) query: QueryCheckEmail): Promise<void> {
    try {
      return this.user_service.checkEmail(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('auth/password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '비밀번호 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async checkPassword(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoCheckPassword,
  ): Promise<void> {
    try {
      return this.user_service.checkPassword(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public refresh(@Req() { user: { id } }: RequestClass): ResRefresh {
    return this.user_service.refresh(id);
  }

  @Post('auth/sign_in')
  @ApiOperation({ summary: '로그인' })
  @ApiCreatedResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async signIn(@Body(new ValidationPipe()) payload: DtoSignIn): Promise<ResSignIn> {
    try {
      return this.user_service.signIn(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('address')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주소 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editAddress(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditAddress,
  ): Promise<void> {
    try {
      return this.user_service.edit(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  public async create(@Body(new ValidationPipe()) payload: DtoCreateUser): Promise<void> {
    try {
      return this.user_service.create(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Req() { user: { id } }: RequestClass): Promise<void> {
    try {
      return this.user_service.leave(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '정보 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editProfile(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditUserInfo,
  ): Promise<void> {
    try {
      return this.user_service.edit(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '비밀번호 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editPassword(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoEditPassword,
  ): Promise<void> {
    try {
      return this.user_service.editPassword(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('restaurant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 리스트 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResGetRestaurantList })
  @ApiQuery({ name: 'category' })
  @ApiQuery({ enum: EnumSortOption, name: 'sortOption', type: 'enum' })
  @ApiNotFoundResponse()
  public async getRestaurantList(
    @Query(new ValidationPipe()) query: QueryGetRestaurantList,
  ): Promise<ResGetRestaurantList[]> {
    try {
      return this.restaurant_service.getList(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
