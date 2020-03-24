import {
  ApiForbiddenResponse, ApiHeader,
  ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import {
  Body, Controller, Get, Headers,
  HttpCode, HttpException, Inject,
  InternalServerErrorException, Patch, ValidationPipe,
} from '@nestjs/common';
import { DtoEditOrderStatus } from '@app/type/req';
import { Header } from '@app/type/etc';
import { OrderService } from '@app/order';
import { ResGetOrderListByRestaurant } from '@app/type/res';
import { UtilService } from '@app/util';
import getPrototypeOf = Reflect.getPrototypeOf;

@ApiTags('restaurant/order')
@Controller('api/restaurant/order')
export class RestaurantOrderController {
  @Inject()
  private readonly od_service: OrderService;
  @Inject()
  private readonly util_service: UtilService;

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '주문 조회' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetOrderListByRestaurant] })
  @ApiForbiddenResponse()
  public async get_orders(@Headers() header: Header): Promise<ResGetOrderListByRestaurant[]> {
    try {
      return this.od_service.get_list_by_restaurant(this.util_service.get_token_body(header));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('status')
  @HttpCode(200)
  @ApiOperation({ summary: '주문 상태 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_order_status(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditOrderStatus,
  ): Promise<void> {
    try {
      return this.od_service.edit_order_status(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}
