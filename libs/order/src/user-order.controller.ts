import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { DtoUploadOrder } from '@app/type/req';
import { Header } from '@app/type/etc';
import { OrderService } from './order.service';
import { ResGetOrderList } from '@app/type/res';
import { UtilService } from '@app/util';

@ApiTags('user/order')
@Controller('api/user/order')
export class UserOrderController {
  @Inject()
  private readonly od_service: OrderService;
  @Inject()
  private readonly util_service: UtilService;

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '주문 등록' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async upload_order(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadOrder,
  ): Promise<void> {
    try {
      return this.od_service.upload(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '주문 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetOrderList] })
  @ApiForbiddenResponse()
  public async get_orders(@Headers() header: Header): Promise<ResGetOrderList[]> {
    try {
      return this.od_service.get_list_by_user(this.util_service.get_token_body(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
