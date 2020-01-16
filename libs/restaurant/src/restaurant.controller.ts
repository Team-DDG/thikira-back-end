import { ResRefresh, ResSignIn, UtilService } from '@app/util';
import {
  Body, Controller, Delete, Get, Headers, HttpCode,
  InternalServerErrorException, Patch, Post, ValidationPipe,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CheckEmailDto, CheckPasswordDto, EditPasswordDto, SignInDto, SignUpDto } from './dto';
import { EditInformationDto } from './dto/edit_information.dto';
import { RestaurantService } from './restaurant.service';

@ApiTags('Restaurant')
@Controller('api/restaurant')
export class RestaurantController {
  constructor(private readonly service: RestaurantService,
              private readonly util: UtilService) {
  }

  @Get('check_email')
  @HttpCode(200)
  @ApiOperation({ summary: '이메일 확인' })
  @ApiOkResponse()
  @ApiConflictResponse()
  public async check_email(@Body(new ValidationPipe()) payload: CheckEmailDto) {
    try {
      return await this.service.check_email(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('sign_up')
  @HttpCode(200)
  @ApiOperation({ summary: '회원가입' })
  @ApiOkResponse()
  public async sign_up(@Body(new ValidationPipe()) payload: SignUpDto) {
    try {
      return await this.service.sign_up(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('auth/sign_in')
  @HttpCode(200)
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: ResSignIn })
  @ApiNotFoundResponse()
  public async sign_in(@Body(new ValidationPipe()) payload: SignInDto) {
    try {
      return await this.service.sign_in(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiHeader({ name: 'X-Refresh-Token' })
  @ApiOkResponse({ type: ResRefresh })
  @ApiForbiddenResponse()
  public async refresh(@Headers('x-refresh-token') token: string) {
    try {
      return await this.service.refresh(this.util.getTokenBody(token));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('leave')
  @HttpCode(200)
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async leave(@Headers('authorization') token: string) {
    try {
      return await this.service.leave(this.util.getTokenBody(token));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('auth')
  @HttpCode(200)
  @ApiOperation({ summary: '토큰 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public auth(@Headers() headers) {
  }

  @Get('auth/password')
  @HttpCode(200)
  @ApiOperation({ summary: '비밀번호 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async check_password(@Headers('authorization') token: string,
                              @Body(new ValidationPipe()) payload: CheckPasswordDto) {
    try {
      return await this.service.check_password(this.util.getTokenBody(token), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('auth/password')
  @HttpCode(200)
  @ApiOperation({ summary: '비밀번호 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_password(@Headers('authorization') token: string,
                             @Body(new ValidationPipe()) payload: EditPasswordDto) {
    try {
      return await this.service.edit(this.util.getTokenBody(token), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('auth/information')
  @HttpCode(200)
  @ApiOperation({ summary: '비밀번호 확인' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_information(@Headers('authorization') token: string,
                                @Body(new ValidationPipe()) payload: EditInformationDto) {
    try {
      return await this.service.edit(this.util.getTokenBody(token), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
