import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { QueryGetMenuCategoryList, QueryGetMenuList } from '@app/type/req';
import { ResGetMenuCategoryList, ResGetMenuList } from '@app/type/res';
import { Header } from '@app/type/etc';
import { MenuService } from './menu.service';

@ApiTags('user/menu')
@Controller('api/user/menu')
export class UserMenuController {
  @Inject()
  private readonly m_service: MenuService;

  @Get('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'r_id' })
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async get_menu_category_list(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetMenuCategoryList,
  ): Promise<ResGetMenuCategoryList[]> {
    try {
      return this.m_service.get_menu_category_list(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'mc_id' })
  @ApiOkResponse({ type: [ResGetMenuList] })
  @ApiForbiddenResponse()
  public async get_menu_list(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetMenuList,
  ): Promise<ResGetMenuList[]> {
    try {
      return this.m_service.get_menu_list(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

}
