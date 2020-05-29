import { Header } from '@app/type/etc';
import {
  DtoEditGroup,
  DtoEditMenu,
  DtoEditMenuCategory,
  DtoEditOption,
  DtoUploadGroup,
  DtoUploadMenu,
  DtoUploadMenuCategory,
  DtoUploadOption,
  ParamRemoveGroup,
  ParamRemoveMenu,
  ParamRemoveMenuCategory,
  ParamRemoveOption,
  QueryGetGroupList,
  QueryGetMenuList,
  QueryGetOptionList,
} from '@app/type/req';
import {
  ResGetGroupList,
  ResGetMenuCategoryList,
  ResGetMenuList,
  ResGetOptionList,
  ResUploadGroup,
  ResUploadMenu,
  ResUploadMenuCategory,
  ResUploadOption,
} from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('restaurant/menu')
@Controller('api/restaurant/menu')
export class RestaurantMenuController {
  @Inject()
  private readonly m_service: MenuService;
  @Inject()
  private readonly util_service: UtilService;

  @Post('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 업로드' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResUploadMenuCategory })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_menu_category(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadMenuCategory,
  ): Promise<ResUploadMenuCategory> {
    try {
      return this.m_service.upload_menu_category(this.util_service.get_token_body(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async get_menu_category_list(@Headers() header: Header): Promise<ResGetMenuCategoryList[]> {
    try {
      return this.m_service.get_menu_category_list(this.util_service.get_token_body(header));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async edit_menu_category(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditMenuCategory,
  ): Promise<void> {
    try {
      return this.m_service.edit_menu_category(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('category/:mc_id')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_menu_category(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveMenuCategory,
  ): Promise<void> {
    try {

      return this.m_service.remove_menu_category(UtilService.parse_ids(param.mc_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 업로드' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResUploadMenu })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_menu(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadMenu,
  ): Promise<ResUploadMenu> {
    try {
      return this.m_service.upload_menu(payload);
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

  @Patch()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_menu(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditMenu,
  ): Promise<void> {
    try {
      return this.m_service.edit_menu(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete(':m_id')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_menu(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveMenu,
  ): Promise<void> {
    try {
      return this.m_service.remove_menu(UtilService.parse_ids(param.m_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 업로드' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResUploadGroup })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_group(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadGroup,
  ): Promise<ResUploadGroup> {
    try {
      return this.m_service.upload_group(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'm_id' })
  @ApiOkResponse({ type: [ResGetGroupList] })
  @ApiForbiddenResponse()
  public async get_group_list(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetGroupList,
  ): Promise<ResGetGroupList[]> {
    try {
      return this.m_service.get_group_list(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_group(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditGroup,
  ): Promise<void> {
    try {
      return this.m_service.edit_group(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('group/:g_id')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_group(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveGroup,
  ): Promise<void> {
    try {
      return this.m_service.remove_group(UtilService.parse_ids(param.g_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 업로드' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResUploadOption })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_option(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadOption,
  ): Promise<ResUploadOption> {
    try {
      return this.m_service.upload_option(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'g_id' })
  @ApiOkResponse({ type: [ResGetOptionList] })
  @ApiForbiddenResponse()
  public async get_option_list(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetOptionList,
  ): Promise<ResGetOptionList[]> {
    try {
      return this.m_service.get_option_list(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_option(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditOption,
  ): Promise<void> {
    try {
      return this.m_service.edit_option(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('option/:o_id')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_option(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveOption,
  ): Promise<void> {
    try {
      return this.m_service.remove_option(UtilService.parse_ids(param.o_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
