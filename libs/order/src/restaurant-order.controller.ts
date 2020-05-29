import { Header } from '@app/type/etc';
import { DtoEditOrderStatus } from '@app/type/req';
import { ResGetOrderList } from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';

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
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetOrderList] })
  @ApiForbiddenResponse()
  public async get_orders(@Headers() header: Header): Promise<ResGetOrderList[]> {
    try {
      return this.od_service.get_list_by_restaurant(this.util_service.get_token_body(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('status')
  @HttpCode(200)
  @ApiOperation({ summary: '주문 상태 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_order_status(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditOrderStatus,
  ): Promise<void> {
    try {
      return this.od_service.edit_order_status(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
