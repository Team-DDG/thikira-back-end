import {
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption,
  DtoGetGroupList, DtoGetMenuList, DtoGetOptionList,
  DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
} from '@app/dto';
import { MenuService } from '@app/menu';
import {
  ResGetGroup, ResGetMenu, ResGetMenuCategory, ResGetOption,
  ResUploadGroup, ResUploadMenu, ResUploadMenuCategory, ResUploadOption,
} from '@app/res';
import { UtilService } from '@app/util';
import { Body, Controller, Delete, Get, Headers, HttpCode, InternalServerErrorException, Param, Patch, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('restaurant/menu')
@Controller('api/restaurant/menu')
export class RestaurantMenuController {
  constructor(private readonly menu_service: MenuService,
              private readonly util_service: UtilService,
  ) {
  }

  @Post('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadMenuCategory })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_menu_category(@Headers() header,
                                    @Body() payload: DtoUploadMenuCategory) {
    try {
      return await this.menu_service.upload_menu_category(this.util_service.get_token_body(header.authorization), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetMenuCategory] })
  @ApiForbiddenResponse()
  public async get_menu_category_list(@Headers() header) {
    try {
      return await this.menu_service.get_menu_category_list(this.util_service.get_token_body(header.authorization));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async edit_menu_category(@Headers() header,
                                  @Body() payload: DtoEditMenuCategory) {
    try {
      return await this.menu_service.edit_menu_category(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('category/:mc_id')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_menu_category(@Headers() header,
                                    @Param('mc_id') param: string) {
    try {
      return await this.menu_service.remove_menu_category(UtilService.parse_ids(param));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadMenu })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_menu(@Headers() header,
                           @Body() payload: DtoUploadMenu) {
    try {
      return await this.menu_service.upload_menu(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetMenu] })
  @ApiForbiddenResponse()
  public async get_menu_list(@Headers() header,
                             @Body() payload: DtoGetMenuList) {
    try {
      return await this.menu_service.get_menu_list(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_menu(@Headers() header,
                         @Body() payload: DtoEditMenu) {
    try {
      return await this.menu_service.edit_menu(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete(':m_id')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_menu(@Headers() header,
                           @Param('m_id') param: string) {
    try {
      return await this.menu_service.remove_menu(UtilService.parse_ids(param));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadGroup })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_group(@Headers() header,
                            @Body() payload: DtoUploadGroup) {
    try {
      return await this.menu_service.upload_group(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetGroup] })
  @ApiForbiddenResponse()
  public async get_group_list(@Headers() header,
                              @Body() payload: DtoGetGroupList) {
    try {
      return await this.menu_service.get_group_list(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_group(@Headers() header,
                          @Body() payload: DtoEditGroup) {
    try {
      return await this.menu_service.edit_group(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('group/:g_id')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_group(@Headers() header,
                            @Param('g_id') param: string) {
    try {
      return await this.menu_service.remove_group(UtilService.parse_ids(param));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadOption })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_option(@Headers() header,
                             @Body() payload: DtoUploadOption) {
    try {
      return await this.menu_service.upload_option(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetOption] })
  @ApiForbiddenResponse()
  public async get_option_list(@Headers() header,
                               @Body() payload: DtoGetOptionList) {
    try {
      return await this.menu_service.get_option_list(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_option(@Headers() header,
                           @Body() payload: DtoEditOption) {
    try {
      return await this.menu_service.edit_option(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('option/:o_id')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_option(@Headers() header,
                             @Param('o_id') param: string) {
    try {
      return await this.menu_service.remove_option(UtilService.parse_ids(param));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
