import { RestaurantService } from '@app/restaurant';
import { EnumSortOption } from '@app/type';
import { Header } from '@app/type/etc';
import {
  DtoCheckPassword,
  DtoCreateUser,
  DtoEditAddress,
  DtoEditPassword,
  DtoEditUserInfo,
  DtoSignIn,
  QueryCheckEmail,
  QueryGetRestaurantList,
} from '@app/type/req';
import { ResGetRestaurantList, ResLoadUser, ResRefresh, ResSignIn } from '@app/type/res';
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
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('api/user')
export class UserController {
  @Inject()
  private readonly restaurantService: RestaurantService;
  @Inject()
  private readonly userService: UserService;
  @Inject()
  private readonly utilService: UtilService;

  @Get()
  @ApiOperation({ summary: '정보 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResLoadUser })
  @ApiNotFoundResponse()
  public async get(@Headers() header: Header): Promise<ResLoadUser> {
    try {
      return this.userService.load(this.utilService.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth')
  @ApiOperation({ summary: '접근 토큰 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth(): void {
    return null;
  }

  @Get('auth/email')
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiQuery({ name: 'email' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async checkEmail(@Query(new ValidationPipe()) query: QueryCheckEmail): Promise<void> {
    try {
      return this.userService.checkEmail(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('auth/password')
  @ApiOperation({ summary: '비밀번호 확인' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async checkPassword(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoCheckPassword,
  ): Promise<void> {
    try {
      return this.userService.checkPassword(this.utilService.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public refresh(@Headers() header: Header): ResRefresh {
    return this.userService.refresh(this.utilService.getTokenBody(header));
  }

  @Post('auth/sign_in')
  @ApiOperation({ summary: '로그인' })
  @ApiCreatedResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async signIn(@Body(new ValidationPipe()) payload: DtoSignIn): Promise<ResSignIn> {
    try {
      return this.userService.signIn(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('address')
  @ApiOperation({ summary: '주소 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editAddress(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditAddress,
  ): Promise<void> {
    try {
      return this.userService.edit(this.utilService.getTokenBody(header), payload);
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
      return this.userService.create(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Headers() header: Header): Promise<void> {
    try {
      return this.userService.leave(this.utilService.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('info')
  @ApiOperation({ summary: '정보 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editProfile(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditUserInfo,
  ): Promise<void> {
    try {
      return this.userService.edit(this.utilService.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('password')
  @ApiOperation({ summary: '비밀번호 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editPassword(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditPassword,
  ): Promise<void> {
    try {
      return this.userService.editPassword(this.utilService.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('restaurant')
  @ApiOperation({ summary: '업체 리스트 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResGetRestaurantList })
  @ApiQuery({ name: 'category' })
  @ApiQuery({ enum: EnumSortOption, name: 'sortOption', type: 'enum' })
  @ApiNotFoundResponse()
  public async getRestaurantList(
    @Headers() token: Header,
    @Query(new ValidationPipe()) query: QueryGetRestaurantList,
  ): Promise<ResGetRestaurantList[]> {
    try {
      return this.restaurantService.getList(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
