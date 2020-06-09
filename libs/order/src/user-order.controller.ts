import { DtoUploadOrder, Header, ResGetOrderList, ResGetOrderListByUser } from '@app/type';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('user/order')
@Controller('api/user/order')
export class UserOrderController {
  @Inject()
  private readonly od_service: OrderService;
  @Inject()
  private readonly util_service: UtilService;

  @Get()
  @ApiOperation({ summary: '주문 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetOrderList] })
  @ApiForbiddenResponse()
  public async getOrderList(@Headers() header: Header): Promise<ResGetOrderListByUser[]> {
    try {
      return this.od_service.getListByUser(this.util_service.getTokenBody(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @ApiOperation({ summary: '주문 등록' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  public async uploadOrder(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadOrder,
  ): Promise<void> {
    try {
      return this.od_service.upload(this.util_service.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
