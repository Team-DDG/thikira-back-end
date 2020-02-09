import { DBService, MenuCategory, Restaurant } from '@app/db';
import { UtilService } from '@app/util';
import { ConflictException, Injectable } from '@nestjs/common';
import { DtoEditMenuCategory, DtoRemoveMenuCategory, DtoUploadMenuCategory } from './dto';
import { ResGetMenuCategoryList } from './res';

@Injectable()
export class MenuService {
  constructor(private readonly db_service: DBService,
              private readonly util_service: UtilService,
  ) {
  }

  public async upload_menu_category(token: string, payload: DtoUploadMenuCategory) {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);

    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_name(payload.name, found_restaurant);
    if (!found_menu_category.isEmpty()) {
      return new ConflictException();
    }
    const menu_category: MenuCategory = new MenuCategory({ ...payload, restaurant: found_restaurant });

    await this.db_service.insert_menu_category(menu_category);
  }

  public async edit_menu_category(token: string, payload: DtoEditMenuCategory) {
    const found_menu_category: MenuCategory = await this.db_service.find_menu_category_by_id(payload.id);
    const menu_category: MenuCategory = new MenuCategory({ ...found_menu_category, name: payload.name });

    await this.db_service.update_menu_category(menu_category);
  }

  public async get_menu_category_list(token: string) {
    const email: string = await this.util_service.get_email_by_token(token);
    const found_restaurant: Restaurant = await this.db_service.find_restaurant_by_email(email);

    const menu_categories: MenuCategory[] = await this.db_service.find_menu_categories_by_restaurant(found_restaurant);
    const result: ResGetMenuCategoryList[] = new Array<ResGetMenuCategoryList>();
    for (let value of menu_categories) {
      result.push({ id: value.id, name: value.name });
    }
    return result;
  }

  public async remove_menu_category(token: string, payload: DtoRemoveMenuCategory) {
    await this.db_service.delete_menu_category(payload.id);
  }
}
