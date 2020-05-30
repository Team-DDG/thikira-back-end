import { Header } from '@app/type/etc';
import { DtoUploadOrder } from '@app/type/req';
import { ResGetOrderList } from '@app/type/res';
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
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('user/order')
@Controller('api/user/order')
export class UserOrderController {
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
      return this.od_service.getListByUser(this.utilService.getTokenBody(header));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
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
      return this.od_service.upload(this.utilService.getTokenBody(header), payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }
}
