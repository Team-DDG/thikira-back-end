import { ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body, Controller, Get, Headers,
  HttpCode, HttpException, Inject,
  InternalServerErrorException,
  Post, ValidationPipe,
} from '@nestjs/common';
import { DtoUploadOrder } from '@app/type/req';
import { OrderService } from '@app/order';
import { ResGetOrderListByUser } from '@app/type/res';
import getPrototypeOf = Reflect.getPrototypeOf;
import { UtilService } from '@app/util';

@ApiTags('user/order')
@Controller('api/user/order')
export class UserOrderController {
  @Inject() private readonly od_service: OrderService;
  @Inject() private readonly util_service: UtilService;

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '주문 등록' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async upload_order(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoUploadOrder,
  ) {
    try {
      return this.od_service.upload(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '주문 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({type: [ResGetOrderListByUser]})
  @ApiForbiddenResponse()
  public async get_orders(@Headers('authorization') token) {
    try {
      return this.od_service.get_list_by_user(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}
