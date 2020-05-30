import { Header } from '@app/type/etc';
import { QueryGetMenuCategoryList, QueryGetMenuList } from '@app/type/req';
import { ResGetMenuCategoryList, ResGetMenuList } from '@app/type/res';
import {
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('user/menu')
@Controller('api/user/menu')
export class UserMenuController {
  @Inject()
  private readonly menuService: MenuService;

  @Get('category')
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'restaurantId' })
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async getMenuCategoryList(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetMenuCategoryList,
  ): Promise<ResGetMenuCategoryList[]> {
    try {
      return this.menuService.getMenuCategoryList(query);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get()
  @ApiOperation({ summary: '메뉴 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'menuCategoryId' })
  @ApiOkResponse({ type: [ResGetMenuList] })
  @ApiForbiddenResponse()
  public async getMenuList(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetMenuList,
  ): Promise<ResGetMenuList[]> {
    try {
      return this.menuService.getMenuList(query);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

}
