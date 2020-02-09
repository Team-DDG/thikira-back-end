import { DBService, Group, Menu, MenuCategory, Option, Restaurant } from '@app/db';
import { UtilService } from '@app/util';
import { ConflictException, Injectable } from '@nestjs/common';
import {
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption,
  DtoGetGroupList, DtoGetMenuList, DtoGetOptionList,
  DtoRemoveGroup, DtoRemoveMenu, DtoRemoveMenuCategory, DtoRemoveOption,
  DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
} from './dto';
import { ResGetGroup, ResGetMenuCategory, ResGetMenu, ResGetOption } from './res';

@Injectable()
export class MenuService {
  constructor(private readonly db_service: DBService,
              private readonly util_service: UtilService,
  ) {
  }

  public async upload_menu_category(token: string, payload: DtoUploadMenuCategory): Promise<void> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);
    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_name(payload.name, found_restaurant);
    if (!found_menu_category.isEmpty()) {
      throw new ConflictException();
    }

    const menu_category: MenuCategory = new MenuCategory({ ...payload, restaurant: found_restaurant });
    await this.db_service.insert_menu_category(menu_category);
  }

  public async get_menu_category(menu_category_id: number): Promise<ResGetMenuCategory> {
    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(menu_category_id);
    return { menu_category_id: found_menu_category.id, name: found_menu_category.name };
  }

  public async get_menu_category_list(token: string): Promise<ResGetMenuCategory[]> {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);

    const found_menu_category: MenuCategory[] = await this.db_service.find_menu_categories_by_restaurant(found_restaurant);
    const result: ResGetMenuCategory[] = new Array<ResGetMenuCategory>();
    for (const loop_menu_category of found_menu_category) {
      result.push({ menu_category_id: loop_menu_category.id, name: loop_menu_category.name });
    }
    return result;
  }

  public async edit_menu_category(token: string, payload: DtoEditMenuCategory): Promise<void> {
    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(payload.menu_category_id);
    const menu_category: MenuCategory = new MenuCategory({ ...found_menu_category, name: payload.name });

    await this.db_service.update_menu_category(menu_category);
  }

  public async remove_menu_category(payload: DtoRemoveMenuCategory): Promise<void> {
    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(payload.menu_category_id);
    const found_menus: Menu[] = await this.db_service.find_menus_by_menu_category(found_menu_category);
    for (const loop_menu of found_menus) {
      const found_groups: Group[] = await this.db_service.find_groups_by_menu(loop_menu);
      for (const loop_group of found_groups) {
        const found_options: Option[] = await this.db_service.find_options_by_group(loop_group);
        for (const loop_option of found_options) {
          await this.db_service.delete_option(loop_option.id);
        }
        await this.db_service.delete_group(loop_group.id);
      }
      await this.db_service.delete_menu(loop_menu.id);
    }
    await this.db_service.delete_menu_category(payload.menu_category_id);
  }

  public async upload_menu(payload: DtoUploadMenu): Promise<void> {
    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(payload.menu_category_id);
    const found_menu: Menu = await this.db_service.find_menu_by_name(payload.name, found_menu_category);
    if (!found_menu.isEmpty()) {
      throw new ConflictException();
    }

    const menu: Menu = new Menu({ ...payload, menu_category: found_menu_category });
    await this.db_service.insert_menu(menu);

    if (payload.group !== undefined && payload.group !== null) {
      const groups: Group[] = new Array<Group>();
      payload.group.forEach((loop_group) => {
        groups.push(new Group({ ...loop_group, menu }));
      });
      await this.db_service.insert_group(groups);
      const found_groups: Group[] = await this.db_service.find_groups_by_menu(menu);

      const options: Option[] = new Array<Option>();
      payload.group.forEach((loop_group, index) => {
        if (loop_group.option != null) {
          loop_group.option.forEach((loop_option) => {
            options.push(new Option({ ...loop_option, group: found_groups[index] }));
          });
        }
      });
      await this.db_service.insert_option(options);
    }
  }

  public async get_menu(menu_id: number): Promise<ResGetMenu> {
    const found_menu: Menu = await this.db_service.find_menu_by_id(menu_id);
    const menu_data = { menu_id: found_menu.id, ...found_menu, id: undefined, group: undefined };
    delete menu_data.id;
    return menu_data;
  }

  public async get_menu_list(payload: DtoGetMenuList): Promise<ResGetMenu[]> {
    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(payload.menu_category_id);
    const result: ResGetMenu[] = new Array<ResGetMenu>();
    const found_menus: Menu[] = await this.db_service.find_menus_by_menu_category(found_menu_category);
    for (const loop_menu of found_menus) {
      const menu: ResGetMenu = new ResGetMenu(loop_menu);
      const found_groups: Group[] = await this.db_service.find_groups_by_menu(loop_menu);
      for (const loop_group of found_groups) {
        const group: ResGetGroup = new ResGetGroup(loop_group);
        const found_options: Option[] = await this.db_service.find_options_by_group(loop_group);
        for (const loop_option of found_options) {
          const option: ResGetOption = new ResGetOption(loop_option);
          group.option.push(option);
        }
        menu.group.push(group);
      }
      result.push(menu);
    }
    return result;
  }

  public async edit_menu(payload: DtoEditMenu): Promise<void> {
    const found_menu: Menu = await this.db_service.find_menu_by_id(payload.menu_id);

    const edit_data = { ...payload, menu_id: undefined };
    delete edit_data.menu_id;
    const menu: Menu = new Menu({ ...found_menu, ...edit_data });

    await this.db_service.update_menu(menu);
  }

  public async remove_menu(payload: DtoRemoveMenu): Promise<void> {
    const found_menu: Menu = await this.db_service.find_menu_by_id(payload.menu_id);
    const found_groups: Group[] = await this.db_service.find_groups_by_menu(found_menu);
    for (const loop_group of found_groups) {
      const found_options: Option[] = await this.db_service.find_options_by_group(loop_group);
      for (const loop_option of found_options) {
        await this.db_service.delete_option(loop_option.id);
      }
      await this.db_service.delete_group(loop_group.id);
    }
    await this.db_service.delete_menu(found_menu.id);
  }

  public async upload_group(payload: DtoUploadGroup): Promise<void> {
    const found_menu: Menu = await this.db_service.find_menu_by_id(payload.menu_id);
    const found_group: Group = await this.db_service.find_group_by_name(payload.name, found_menu);
    if (!found_group.isEmpty()) {
      throw new ConflictException();
    }
    const group: Group = new Group({ ...payload, menu: found_menu });

    await this.db_service.insert_group(group);
  }

  public async get_group(group_id: number): Promise<ResGetGroup> {
    const found_group: Group = await this.db_service.find_group_by_id(group_id);
    const group_data = { group_id: found_group.id, ...found_group, id: undefined, option: undefined };
    delete group_data.id;
    return group_data;
  }

  public async get_group_list(payload: DtoGetGroupList): Promise<ResGetGroup[]> {
    const found_menu: Menu = await this.db_service.find_menu_by_id(payload.menu_id);
    const result: ResGetGroup[] = new Array<ResGetGroup>();
    const found_groups: Group[] = await this.db_service.find_groups_by_menu(found_menu);
    for (const loop_group of found_groups) {
      const group: ResGetGroup = new ResGetGroup(loop_group);
      const found_options: Option[] = await this.db_service.find_options_by_group(loop_group);
      for (const loop_option of found_options) {
        const option: ResGetOption = new ResGetOption(loop_option);
        group.option.push(option);
      }
      result.push(group);
    }
    return result;
  }

  public async edit_group(payload: DtoEditGroup): Promise<void> {
    const found_group: Group = await this.db_service.find_group_by_id(payload.group_id);
    const edit_data = { ...payload, group_id: undefined };
    delete edit_data.group_id;
    const group: Group = new Group({ ...found_group, ...edit_data });

    await this.db_service.update_group(group);
  }

  public async remove_group(payload: DtoRemoveGroup): Promise<void> {
    const found_group: Group = await this.db_service.find_group_by_id(payload.group_id);
    const found_options: Option[] = await this.db_service.find_options_by_group(found_group);
    for (const loop_option of found_options) {
      await this.db_service.delete_option(loop_option.id);
    }
    await this.db_service.delete_group(payload.group_id);

  }

  public async upload_option(payload: DtoUploadOption): Promise<void> {
    const found_group: Group = await this.db_service.find_group_by_id(payload.group_id);
    const found_option: Option = await this.db_service.find_option_by_name(payload.name, found_group);
    if (!found_option.isEmpty()) {
      throw new ConflictException();
    }

    const option: Option = new Option({ ...payload, group: found_group });

    await this.db_service.insert_option(option);
  }

  public async get_option(option_id: number): Promise<ResGetOption> {
    const found_option: Option = await this.db_service.find_option_by_id(option_id);
    const option_data = { option_id: found_option.id, ...found_option, id: undefined, option: undefined };
    delete option_data.id;
    return option_data;
  }

  public async get_option_list(payload: DtoGetOptionList): Promise<ResGetOption[]> {
    const found_group: Group = await this.db_service.find_group_by_id(payload.group_id);
    const result: ResGetOption[] = new Array<ResGetOption>();
    const found_options: Option[] = await this.db_service.find_options_by_group(found_group);

    for (const loop_option of found_options) {
      const option: ResGetOption = new ResGetOption(loop_option);
      result.push(option);
    }
    return result;
  }

  public async edit_option(payload: DtoEditOption): Promise<void> {
    const found_option: Option = await this.db_service.find_option_by_id(payload.option_id);
    const edit_data = { ...payload, option_id: undefined };
    delete edit_data.option_id;
    const option: Option = new Option({ ...found_option, ...edit_data });

    await this.db_service.update_option(option);
  }

  public async remove_option(payload: DtoRemoveOption): Promise<void> {
    await this.db_service.delete_option(payload.option_id);
  }

  public print(obj) {
    console.log(obj);
  }
}
