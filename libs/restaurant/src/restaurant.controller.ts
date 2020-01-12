import { Header, Token, UtilService } from '@app/util';
import { Body, Controller, Get, Headers, HttpCode, InternalServerErrorException, Post, ValidationPipe } from '@nestjs/common';
import { ApiConflictResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckEmailDto, SignInDto, SignUpDto } from './dto';
import { RestaurantService } from './restaurant.service';

@ApiTags('Restaurant')
@Controller('api/restaurant')
export class RestaurantController {
  constructor(private readonly service: RestaurantService,
              private readonly util: UtilService) {
  }

  @Post('check_email')
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
  @ApiResponse({
    status: 200,
    type: Token,
  })
  @ApiResponse({ status: 404 })
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
  @ApiResponse({ status: 200 })
  @ApiHeader({
    description: '재발급 토큰',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imxqc3VuZzA4MDUiLCJpYXQiOjE1NzU4NjQwMjAsImV4cCI6MTU3NzA3MzYyMH0.dMt1s60OpFt-7mWIzeVpDdig6r8437DMQOTIB11L4is',
    name: 'X-Refresh-Token',
  })
  public async refresh(@Headers() headers: Header) {
    try {
      return await this.service.refresh(await this.util.getTokenBody(headers.token));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
