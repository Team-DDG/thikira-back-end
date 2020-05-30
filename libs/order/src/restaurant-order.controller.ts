import { Header } from '@app/type/etc';
import { DtoEditOrderStatus } from '@app/type/req';
import { ResGetOrderList } from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Get,
  Headers,
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
  private readonly utilService: UtilService;

  @Get()
  @ApiOperation({ summary: '주문 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetOrderList] })
  @ApiForbiddenResponse()
  public async getOrderList(@Headers() header: Header): Promise<ResGetOrderList[]> {
    try {
      return this.od_service.getListByRestaurant(this.utilService.getTokenBody(header));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Patch('status')
  @ApiOperation({ summary: '주문 상태 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editOrderStatus(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditOrderStatus,
  ): Promise<void> {
    try {
      return this.od_service.editOrderStatus(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }
}
